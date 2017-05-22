import DynamoFriendly = require("./DynamoFriendly");
import Constants = require("../../constants");
import Dynamo = require("./Dynamo");
import Factory = require("./FactoryFriendly");

import debug = require("debug");
var Log = debug("app:services:dynamo:helper");
var Error = debug("app:services:dynamo:helper:error");

export interface SaveOpts {
  requireNew?: boolean;
  fields: any[];
  ifNotExists?: string;
}

export interface GetOpts {
  fields?: any[];
  scanModelHashKey?: DynamoFriendly;
  rangeKey?: string;
  filters?: any;
}

export interface RemoveOpts {
}

export interface ScanResult<T> {
  Items: T[];
  Count: number;
}

function _createModelInstance<T extends DynamoFriendly>(type: { new() : T; }): T {
  return new type();
}

function _dynamoObj(type: string, value: string) {
  var ret = {};
  ret[type] = value;
  return ret;
}

function _dynamoKey(model : DynamoFriendly) {
  var ret = {};
  ret[model.dynamoHashKey] = _toDynamoDescriptor(model, model.dynamoHashKey);
  if (model.dynamoRangeKey) {
    ret[model.dynamoRangeKey] = _toDynamoDescriptor(model, model.dynamoRangeKey);
  }
  return ret;
}

function _getPath(model: DynamoFriendly, path: string) : any {
  try {
    var parts = path.split('.');
    var ptr = model;
    for(var i = 0; i < parts.length; i++) {
      ptr = ptr[parts[i]]
    }
    return ptr;    
  } catch(ex) {
    console.log("Exception in _getPath", path, model, ex);
    return null;
  }
}

function _toDynamoDescriptor(model: DynamoFriendly, key: string, path?: string) : any {
  var lookup : string;
  if (path) {
    lookup = path + '.' + key;
  } else {
    lookup = key;
  }
  var val = _getPath(model, lookup);
    
  if (typeof model.savedProperties[lookup] != 'undefined') {
    if (typeof model.savedProperties[lookup].type != 'undefined') {
      if (typeof val == 'undefined') {
        return null;
      } else if (val == null) {
        return null;
      }      
      var type = model.savedProperties[lookup].type;
      
      if (type == 'L') {
        var subtype = model.savedProperties[key].subtype;
        return {'L': model[key].map((v) => _dynamoObj(subtype, v))}
      } else if (type == 'SS') {
        return {'SS': model[key]}
      } else if (type == 'B') {
        return {'B': model[key]}
      } else if (type == 'NS') {
        return {'NS': model[key].map((v) => v.toString())}
      } else if (type == 'BOOL') {
        return {'BOOL': model[key]}  
      } else if (type == 'M') {
        var theMap = {};
        for (var key2 in model[key]) {
          var newPath;
          if (path) {
            newPath = path + '.' + key;
          } else {
            newPath = key;
          }
          theMap[key2] = _toDynamoDescriptor(model, key, newPath);
        }
        return {'M': theMap};
      } else {
        return _dynamoObj(type, model[key].toString());
      }
    }
  }
  return null;
}

export function _fromDynamoDescriptor(descriptor:any):any {
  if (descriptor.S) {
    return <string>descriptor.S
  }
  if (descriptor.N) {
    return parseFloat(descriptor.N);
  }
  if (descriptor.L) {
    return descriptor.L.map(_fromDynamoDescriptor);
  }
  if (descriptor.SS) {
    return descriptor.SS;
  }
  if (descriptor.B) {
    return descriptor.B;
  }
  if (descriptor.BOOL) {
    return (descriptor.BOOL === true);
  }
  if (descriptor.NS) {
    return descriptor.NS.map((x) => {return parseFloat(x);});
  }

  Error("Haven't built support for descriptor for %s", JSON.stringify(descriptor));
  return null;
}

export function update(model: DynamoFriendly, opts: SaveOpts, cb: (err: any) => void) {

  if (typeof opts.fields == 'undefined') {
    opts.fields = new Array<string>();
    for (var f in model.savedProperties) {
      if (f != model.dynamoHashKey) {
        opts.fields.push(f)
      }
    }
  }

  var updateClauses = [];
  var expressionAttributeNames = {};
  var expressionAttributeValues = {};

  for (var field of opts.fields) {
    var value = model[field];
    if ((value == null) || (value === '')) {
      // Null field. Don't necessarily want to remove though unless explicitly asked to.
      // Removing a field automatically is too dangerous.
    } else {
      var safeField = field.replace(/-/g, "XX");
      updateClauses.push(`#${safeField} = :${safeField}`);
      try {
        expressionAttributeValues[`:${safeField}`] = _toDynamoDescriptor(model, field);
      } catch (ex) {
        console.log("Exception trying to create a dynamo descriptor", model, field, ex);
        throw ex;
      }
      expressionAttributeNames[`#${safeField}`] = field;
    }
  }

  var updateClause = 'SET ' + updateClauses.join(', ');

  var params = {
    TableName: model.dynamoTableName,
    Key: _dynamoKey(model),
    UpdateExpression: updateClause,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  };

  Log("Trying to update model with Dynamo config %s", JSON.stringify(params));
  console.log("update item", params);
  
  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      console.log(err);
      Error("Could not update item to table '%s' with key '%s'. Error: %s", model.dynamoTableName, model[model.dynamoHashKey], err);
      return cb("Could not update item.");
    } else {
      Log("Item update table '%s' item with key '%s'", model.dynamoTableName, model[model.dynamoHashKey]);
      cb(null);
    }
  });
}

export function remove(model: DynamoFriendly, opts: RemoveOpts, cb: (err?: any) => void) {
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName
  };
  Dynamo.deleteItem(params, (err, data) => {
    if (err) {
      Error("Could not delete item");
      return cb(err);
    }
    cb();
  });
}

var skipFields = {
  'SS': true,
  'NS': true,
  'L': true,
  'M': true
}

export function insert(model: DynamoFriendly, opts: SaveOpts, cb: (err?: any, model?: any) => void) {

  if (typeof opts.fields == 'undefined') {
    opts.fields = new Array<string>();
    for (var f in model.savedProperties) {
      if ((f != model.dynamoHashKey) && (f != model.dynamoRangeKey)) {
        opts.fields.push(f)
      }
    }
  }

  var item = _dynamoKey(model);
   
  for (var field of opts.fields) {    
    if ((typeof model[field] != 'undefined') && (model[field] != null) && model.savedProperties[field] && model.savedProperties[field].type) {
      
      if (skipFields[model.savedProperties[field].type] && (model[field].length == 0)) {
        continue;
      }
      
      var toAddTo = item;

      if (field.indexOf('.') >= 0) {
        // OOH! A map.
        var parts = field.split('.');
        if (typeof item[parts[0]] == 'undefined') {
          item[parts[0]] = {};
        }
        toAddTo = item[parts[0]];
      }

      toAddTo[field] = _toDynamoDescriptor(model, field);
    }
  }

  var params = {
    TableName: model.dynamoTableName,
    Item: item
  };
  
  if (opts.ifNotExists) {
    params['ConditionExpression'] = `attribute_not_exists(${opts.ifNotExists})`;
  }

  Log("Trying to insert model with Dynamo config %s", JSON.stringify(params));

  Dynamo.putItem(params, function(err, data) {
    if (err) {
      Error("Could not insert item to table '%s' with key '%s'. Error: %s", model.dynamoTableName, model[model.dynamoHashKey], err);      
      console.log(err);
      return cb("Could not save model.");
    } else {
      Log("Item inserted to table '%s' with key '%s'", model.dynamoTableName, model[model.dynamoHashKey]);
      cb(null, model);
    }
  });
}

/*
 * Example call:
 *   findOne(User, {id: 'ted'}, cb)
 */
export function getForKey<T extends DynamoFriendly>(klass: { new(): T ;}, key: string, opts: GetOpts, cb: (err: any, user?: T) => void) {
  var model : T = Factory.Create(klass);
  model[model.dynamoHashKey] = key;

  var params = {
    TableName: model.dynamoTableName,
    Key: {}
  };
  params.Key[model.dynamoHashKey] = _toDynamoDescriptor(model, model.dynamoHashKey);
  if (opts.rangeKey) {
    model[model.dynamoRangeKey] = opts.rangeKey;
    params.Key[model.dynamoRangeKey] = _toDynamoDescriptor(model, model.dynamoRangeKey);
  }
  
  Dynamo.getItem(params, function(err, data) {
    if (err) {
      Error('Could not find item with fields: %s', JSON.stringify(params));
      return cb("No record found.");
    }
    if ((!data) || (!data.Item)) {
      Error('Found record, but empty, for fields: %s', JSON.stringify(params) );
      return cb("Record was empty.");
    }
    else {
      for (var prop in data.Item) {
        model[prop] = _fromDynamoDescriptor(data.Item[prop]);
      }
      if (model.postLoad) {
        model.postLoad();
      }
      cb(null, model);
    }
  });
}

/*
 * Example call:
 *   scan(User, cb)
 */
export function scan<T extends DynamoFriendly>(klass: { new(): T ;}, opts: GetOpts, cb: (err: any, user?: ScanResult<T>) => void) {
  var throwAwayModel : T = Factory.Create(klass);
  var params = {
    TableName: throwAwayModel.dynamoTableName
  };
  
  if (opts.scanModelHashKey) {
    var hashKey = opts.scanModelHashKey.dynamoHashKey;
    var hashType = opts.scanModelHashKey.savedProperties[hashKey].type;
    var hashVal = opts.scanModelHashKey[hashKey];
    params['ExpressionAttributeValues'] = { ":val": {} };
    params['ExpressionAttributeValues'][':val'][hashType] = hashVal;
    params['ExpressionAttributeNames'] = {"#field": hashKey},
    params['FilterExpression'] = '#field = :val';
    if (opts.fields && opts.fields.length) {
      var toGet = [];
      for (var i = 0; i < opts.fields.length; i++) {        
        var variable = `#proj${i}`;
        params['ExpressionAttributeNames'][variable] = opts.fields[i];
        toGet.push(variable);        
      }      
      params['ProjectionExpression'] = toGet.join(", ");
    }
  } else {
    if (opts.fields && opts.fields.length) {
      params['AttributesToGet'] = opts.fields;
    }    
  }

  if (opts.filters) {
    params['ScanFilter'] = {};  
    for (var field in opts.filters) {
      var valueBlock = {};
      valueBlock[throwAwayModel.savedProperties[field].type] = opts.filters[field]
      params['ScanFilter'][field] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [valueBlock]
      }
    }
  }
  var res = {
    Count: 0,
    Items: [],
    ScannedCount: 0
  };
  
  var doIt = (startKey?:any) => {
    if (startKey) {
      params['ExclusiveStartKey'] = startKey 
    }

    Dynamo.scan(params, function(err, data) {
      if (err) {
        Error('Could not scan items: %s', err);
        return cb("Could not scan items.");
      }
      if ((!data) || (!data.Items)) {
        Error('Got result, but no Items');
        return cb("Could not scan items.");
      }
      else {
        res.Count += data.Count;
        res.ScannedCount += data.ScannedCount;
        for (var i = 0; i < data.Items.length; i++) {
          var model : T = Factory.Create(klass);
          for (var prop in data.Items[i]) {
            model[prop] = _fromDynamoDescriptor(data.Items[i][prop]);
          }
          if (model.postLoad) {
            model.postLoad();
          }
          res.Items.push(model);
        }
        if (data.LastEvaluatedKey) {
          doIt(data.LastEvaluatedKey);          
        } else {
          cb(null, res);          
        }
      }
    });    
  };
  doIt();


}

/*
* Example call:
*   scan(User, cb)
*/
export function listPush<T extends DynamoFriendly>(model: T, field: string, value: string, cb: (err?: any) => void) {
  var thing = {};
  thing[model.savedProperties[field].subtype] = value;
  var updateExpression = `SET #field = list_append(if_not_exists(#field, :empty), :val)`
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName,
    ExpressionAttributeValues: {
      ":val": {L: [thing]},
      ":empty": {L: []}
    },
    ExpressionAttributeNames: {"#field": field},
    UpdateExpression: updateExpression
  };
  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      console.log(err);
      Error('Could not push item to array');
      cb(err);
    } else {
      cb();
    }
  });
}

export function createEmptyDictProp(model: DynamoFriendly, dictProp:string, cb: (err?: any) => void) {
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName,
    ExpressionAttributeValues: {":empty": {"M":{}}},
    ExpressionAttributeNames: {"#p": dictProp},    
    UpdateExpression: 'SET #p = if_not_exists(#p, :empty)'
  }
  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      console.log(err);
      Error('Could not perform dictionary update');
      cb(err);
    } else {
      console.log(data);
      cb();
    }
  });
}

export function updateDictProp(model: DynamoFriendly, dictProp:string, dict: any, cb: (err?: any) => void) {
  // SET #pr.FiveStar[0] = :r1, #pr.FiveStar[1] = :r2
  var ExpressionAttributeNames = {};
  var ExpressionAttributeValues = {};
  var clauses = [];
  ExpressionAttributeNames['#' + dictProp] = dictProp;
  for (var key in dict) {
    var val = {};
    var dotted = `${dictProp}.${key}`;
    ExpressionAttributeNames['#' + key] = key;
    if (!(model.savedProperties[dotted] && model.savedProperties[dotted].type)) {
      Error("Skipping property %s because we don't know the type", dotted);
      continue;
    }
    val[model.savedProperties[dotted].type] = dict[key];
    console.log('dict[key] is', dict[key], val);
    ExpressionAttributeValues[':' + key] = val;
    clauses.push(`#${dictProp}.#${key} = :${key}`);
  }
  var updateExpression = 'SET ' + clauses.join(',');
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ExpressionAttributeNames: ExpressionAttributeNames,
    UpdateExpression: updateExpression
  };
  console.log(params);
  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      Log("Error from DictUpdate.. trying to set empty dict first and will retry");
      createEmptyDictProp(model, dictProp, (err2) => {
        Dynamo.updateItem(params, function(err3, data) {
          if (err3) {
            console.log(err);
            Error('Could not perform dictionary update');
            cb(err);            
          } else {
            console.log(data);
            cb();            
          }
        });                
      });
    } else {
      console.log(data);
      cb();
    }
  });  
}


/*
* Example call:
*   scan(User, cb)
*/
export function setAdd<T extends DynamoFriendly>(model: T, field: string, values: string[], cb: (err?: any) => void) {
  var thing = {};
  thing[model.savedProperties[field].type] = values;

  var updateExpression = `ADD #field :val`
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName,
    ExpressionAttributeValues: { ":val": thing},
    ExpressionAttributeNames: {"#field": field},
    UpdateExpression: updateExpression
  };

  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      console.log(err);
      Error('Could not push item to array');
      cb(err);
    } else {
      console.log(data);
      cb();
    }
  });
}


// /*
// * Example call:
// *   scan(User, cb)
// */
export function setDelete<T extends DynamoFriendly>(model: T, field: string, values: string[], cb: (err?: any) => void) {
  var thing = {};
  thing[model.savedProperties[field].type] = values;

  var updateExpression = `DELETE #field :val`
  var params = {
    Key: _dynamoKey(model),
    TableName: model.dynamoTableName,
    ExpressionAttributeValues: { ":val": thing},
    ExpressionAttributeNames: {"#field": field},
    UpdateExpression: updateExpression
  };
  Dynamo.updateItem(params, function(err, data) {
    if (err) {
      console.log(err);
      Error('Could not push item to array');
      cb(err);
    } else {
      console.log(data);
      cb();
    }
  });
}