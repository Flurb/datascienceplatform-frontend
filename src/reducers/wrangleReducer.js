import { INCREMENT_COUNT } from '../constants/countLabels';

const incrementCount = (state) => {
  return Object.assign({}, state, { count: 0 });
};

const ACTION_HANDLERS = {
  [INCREMENT_COUNT] : (state) => incrementCount(state)
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { count: 'none' };
export default function countReducer (state = initialState, action) {
  if (!action) {
    return state;
  }
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
