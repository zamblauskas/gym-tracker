export interface Program {
  id: string;
  name: string;
  routineIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProgramInput {
  name: string;
  routineIds: string[];
}

export interface UpdateProgramInput {
  name?: string;
  routineIds?: string[];
}
