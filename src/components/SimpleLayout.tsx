import { Outlet } from "react-router-dom";

export function SimpleLayout() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Hello! Simple Layout</h1>
      <Outlet />
    </div>
  );
}

export default SimpleLayout; 