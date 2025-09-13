import { Fragment } from "react";
import { Navigate, Route, Routes as Router } from "react-router-dom";
import { ProtectRoute } from "../../protect/protect";
import { ProtectDashboardRoute } from "../../protect/protect-dashboard";

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
