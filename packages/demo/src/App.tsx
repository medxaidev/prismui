import { PrismUIProvider } from '@prismui/react';
import { usePage, useModal, useDrawer, useNotification, useRuntimeState } from '@prismui/react';
import { runtime } from './setup';
import { Dashboard } from './pages/Dashboard';
import { PatientDetail } from './pages/PatientDetail';
import { ConfirmModal } from './components/ConfirmModal';
import { EventLog } from './components/EventLog';
import { AuditLog } from './components/AuditLog';
import { DrawerPanel } from './components/DrawerPanel';
import { NotificationPanel } from './components/NotificationPanel';
import { ModuleStatusPanel } from './components/ModuleStatusPanel';
import { FormAsyncPanel } from './components/FormAsyncPanel';
import { DSLPanel } from './components/DSLPanel';

function PageRouter() {
  const { currentPage } = usePage();

  switch (currentPage) {
    case 'PatientDetail':
      return <PatientDetail />;
    case 'Dashboard':
    default:
      return <Dashboard />;
  }
}

function ModalLayer() {
  const { isOpen } = useModal();

  return (
    <>
      {isOpen('confirm') && <ConfirmModal />}
    </>
  );
}

function StatusBar() {
  const state = useRuntimeState();
  const { currentPage, isLocked } = usePage();
  const { modalStack } = useModal();
  const { drawerStack } = useDrawer();
  const { count: notifCount } = useNotification();

  return (
    <div style={{
      padding: '8px 16px',
      background: '#f0f0f0',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      gap: '16px',
      fontSize: '13px',
      fontFamily: 'monospace',
      flexWrap: 'wrap',
    }}>
      <span><b>version:</b> {state.version}</span>
      <span><b>page:</b> {currentPage ?? '(none)'}</span>
      <span><b>locked:</b> {isLocked ? '🔒 YES' : 'no'}</span>
      <span><b>modals:</b> {modalStack.length > 0 ? modalStack.join(', ') : '(none)'}</span>
      <span><b>drawers:</b> {drawerStack.length > 0 ? drawerStack.map(d => d.drawerId).join(', ') : '(none)'}</span>
      <span><b>notifications:</b> {notifCount}</span>
    </div>
  );
}

export function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ padding: '16px', margin: 0, borderBottom: '2px solid #333' }}>
          PrismUI Runtime Demo
        </h1>
        <StatusBar />
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ flex: 1, padding: '16px', borderRight: '1px solid #ddd', minHeight: 400 }}>
            <PageRouter />
          </div>
          <div style={{ width: 320, padding: '16px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DrawerPanel />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <NotificationPanel />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <ModuleStatusPanel />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <FormAsyncPanel />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <DSLPanel />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <EventLog />
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
            <AuditLog />
          </div>
        </div>
        <ModalLayer />
      </div>
    </PrismUIProvider>
  );
}
