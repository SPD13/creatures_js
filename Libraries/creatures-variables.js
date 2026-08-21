// Creatures 3 Variable Database
// Extracted from SUPPORT_FILES/VariableName.txt
const CREATURES_VARIABLES = [
  // Neuron Variables (0-7)
  { id: 0, type: 'Neuron', description: 'Neuron Variable 0', name: 'State' },
  { id: 1, type: 'Neuron', description: 'Neuron Variable 1', name: 'Input' },
  { id: 2, type: 'Neuron', description: 'Neuron Variable 2', name: 'Output' },
  { id: 3, type: 'Neuron', description: 'Neuron Variable 3', name: 'Susceptibility' },
  { id: 4, type: 'Neuron', description: 'Neuron Variable 4', name: 'Susceptibility Input' },
  { id: 5, type: 'Neuron', description: 'Neuron Variable 5', name: 'Var  5' },
  { id: 6, type: 'Neuron', description: 'Neuron Variable 6', name: 'Var  6' },
  { id: 7, type: 'Neuron', description: 'Neuron Variable 7', name: 'Neural Growth Factor' },
  
  // Dendrite Variables (8-15)
  { id: 8, type: 'Dendrite', description: 'Dendrite Variable 0', name: 'Weight' },
  { id: 9, type: 'Dendrite', description: 'Dendrite Variable 1', name: 'Var  1' },
  { id: 10, type: 'Dendrite', description: 'Dendrite Variable 2', name: 'Var  2' },
  { id: 11, type: 'Dendrite', description: 'Dendrite Variable 3', name: 'Var  3' },
  { id: 12, type: 'Dendrite', description: 'Dendrite Variable 4', name: 'Last Signal' },
  { id: 13, type: 'Dendrite', description: 'Dendrite Variable 5', name: 'Var  5' },
  { id: 14, type: 'Dendrite', description: 'Dendrite Variable 6', name: 'Var  6' },
  { id: 15, type: 'Dendrite', description: 'Dendrite Variable 7', name: 'Strength' }
];

// Export for use in the application
// Browser environment
if (typeof window !== 'undefined') {
  window.CREATURES_VARIABLES = CREATURES_VARIABLES;
}

// Node.js/Module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CREATURES_VARIABLES;
}
