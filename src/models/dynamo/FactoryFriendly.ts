// This is a silly pattern required in order to instantiate new
// instances of a templated type. See:
// http://stackoverflow.com/questions/24677592/generic-type-inference-with-class-argument/26696435#26696435

export interface FactoryFriendly {

};

export function Create<T extends FactoryFriendly>(type: { new(): T ;} ): T {
  // do stuff to return new instance of T.
  return new type();
}