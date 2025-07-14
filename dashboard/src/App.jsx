import React from 'react';
import { Layout } from 'antd';
import './App.css';
import Menu from './components/Menu';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Setting from './pages/Setting';
import Chatbot from './components/Chatbot/Chatbot';

const { Header, Footer, Sider, Content } = Layout;

// Define styles

const contentStyle = {
  textAlign: 'center',
  minHeight: 'calc(100vh - 184px)',
  padding: '20px',
};

const siderStyle = {
  width: '16% !important',
  backgroundColor: '#fff',
};

const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
};

const layoutStyle = {
  minHeight: '100vh',
  width: '100%',
};

// Define AppLayout component first
const AppLayout = () => (
  <Layout style={layoutStyle}>
    <Sider style={siderStyle}>
      <Menu style={{ width: '100%', height: '100%' }} />
    </Sider>
    <Layout>
      <Content style={contentStyle}>
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

// Then define the router
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/devices",
        children: [
          {
            index: true,
            element: <Devices />,
          },
          {
            path: ":deviceId",
            element: <DeviceDetail />,
          }
        ]
      },
      {
        path: "/setting",
        element: <Setting />,
      }
    ],
  },
]);

// Finally, define and export the App component
const App = () => (
  <>
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router}
    />
    <Chatbot />
  </>
);
export default App;