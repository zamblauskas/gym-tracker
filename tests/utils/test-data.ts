export const data = {
  exerciseTypes: {
    et1: {
      name: 'Test Exercise Type'
    },
    et2: {
      name: 'Test Exercise Type 2'
    }
  },

  gyms: {
    g1: {
      name: 'Test Gym'
    },
    g2: {
      name: 'Test Gym 2'
    },
    g3: {
      name: 'Test Gym 3'
    }
  },

  exercises: {
    e1: {
      name: 'Test Exercise',
      machineBrand: 'Test Machine',
      targetRepRange: { min: 1, max: 2 },
      targetRepsInReserve: 3
    },
    e2: {
      name: 'Test Exercise 2',
      machineBrand: 'Test Machine 2',
      targetRepRange: { min: 4, max: 5 },
      targetRepsInReserve: 6
    },
    eNull: {
      name: 'Test Exercise',
      machineBrand: null,
      targetRepRange: { min: null, max: null },
      targetRepsInReserve: null
    }
  }
};
