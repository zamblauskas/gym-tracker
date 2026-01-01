export interface Compact {
  id: string;
  name: string;
  program: {
    id: string;
    name: string;
  };
}

export interface Detail {
  id: string;
  name: string;
  program: {
    id: string;
    name: string;
  };
  exerciseTypeIds: string[];
}
