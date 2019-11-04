let iniState = {
  isAuth: false,
  data: {}
};
const todos = (state = iniState, action) => {
  switch (action.type) {
    case "AUTH_METAMASK":
      return {
        ...state,
        isAuth: action.isAuth,
        data: action.data
      };
    case "TOGGLE_TODO":
      return state;
    default:
      return state;
  }
};

export default todos;
