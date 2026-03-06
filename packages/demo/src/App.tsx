import { PrismUIProvider } from '@prismui/react';
import { usePage, useModal, useRuntimeState } from '@prismui/react';
import { runtime } from './setup';
import { Dashboard } from './pages/Dashboard';
import { PatientDetail } from './pages/PatientDetail';
import { ConfirmModal } from './components/ConfirmModal';
import { EventLog } from './components/EventLog';
import { AuditLog } from './components/AuditLog';

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

  return (
    <div style={{
      padding: '8px 16px',
      background: '#f0f0f0',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      gap: '16px',
      fontSize: '13px',
      fontFamily: 'monospace',
    }}>
      <span><b>version:</b> {state.version}</span>
      <span><b>page:</b> {currentPage ?? '(none)'}</span>
      <span><b>locked:</b> {isLocked ? '🔒 YES' : 'no'}</span>
      <span><b>modals:</b> {modalStack.length > 0 ? modalStack.join(', ') : '(none)'}</span>
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
