import { Fragment } from "react";
import { Navigate, Route, Routes as Router } from "react-router-dom";
import { ProtectRoute } from "../../protect/protect";
import { ProtectDashboardRoute } from "../../protect/protect-dashboard";

import {
  AdminsDashboard,
  GroupAdminsDashboard,
  StudentsDashboard,
  GroupsDashboard,
  Home,
  HomeDashboard,
  Login,
  Register,
  LoginDashboard,
  MyGroupDashboard,
  QuestionsDashboard,
  TestsDashboard,
  LinksDashboard,
  OtherDashboard,
  Tests,
  StartTest,
  Attempt,
  AttemptResult,
} from "../../pages";
import { LayoutStudent } from "../../components";

const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

const protectedRoutes = [
  { path: "/", element: <Home /> },
  { path: "/tests", element: <Tests /> },
  { path: "/tests/:id/start", element: <StartTest /> },
  { path: "/attempts/:attemptId", element: <Attempt /> },
  { path: "/attempts/:attemptId/result", element: <AttemptResult /> },
];
const protectedDashboardRoutes = [
  {
    path: "/dashboard-panel-admin/xyz/students",
    element: <StudentsDashboard />,
  },
  { path: "/dashboard-panel-admin/xyz", element: <HomeDashboard /> },
  { path: "/dashboard-panel-admin/xyz/admins", element: <AdminsDashboard /> },
  { path: "/dashboard-panel-admin/xyz/groups", element: <GroupsDashboard /> },
  {
    path: "/dashboard-panel-admin/xyz/questions",
    element: <QuestionsDashboard />,
  },
  {
    path: "/dashboard-panel-admin/xyz/tests",
    element: <TestsDashboard />,
  },
  {
    path: "/dashboard-panel-admin/xyz/links",
    element: <LinksDashboard />,
  },
  {
    path: "/dashboard-panel-admin/xyz/my-group",
    element: <MyGroupDashboard />,
  },
  {
    path: "/dashboard-panel-admin/xyz/other",
    element: <OtherDashboard />,
  },
  {
    path: "/dashboard-panel-admin/xyz/group-admins",
    element: <GroupAdminsDashboard />,
  },
];

export const RouterComponent = () => {
  return (
    <Fragment>
      <Router>
        {publicRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        {/* Public route */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route
          path="/dashboard-panel-admin/xyz/login"
          element={<LoginDashboard />}
        />

        {/* Protected routes */}
        <Route element={<LayoutStudent />}>
          {protectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<ProtectRoute>{route.element}</ProtectRoute>}
            />
          ))}
        </Route>

        {/* Protected routes */}
        {protectedDashboardRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectDashboardRoute>{route.element}</ProtectDashboardRoute>
            }
          />
        ))}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Router>
    </Fragment>
  );
};
