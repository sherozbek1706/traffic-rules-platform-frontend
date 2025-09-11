import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "./slice/admin-slice.js";
import groupsReducer from "./slice/groups-slice.js";

const store = configureStore({
  reducer: {
    admin: adminReducer,
    groups: groupsReducer,
  },
});

export default store;
