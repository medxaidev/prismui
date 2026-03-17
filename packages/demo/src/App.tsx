import { useEffect } from 'react';
import { PrismUIProvider } from '@prismui/react';
import { usePage, useModal, useRuntimeState } from '@prismui/react';
import { runtime } from './setup';
import './styles.css';

// Feature pages
import { OverviewPage } from './pages/OverviewPage';
import { PageModulePage } from './pages/PageModulePage';
import { ModalModulePage } from './pages/ModalModulePage';
import { DrawerModulePage } from './pages/DrawerModulePage';
import { NotificationPage } from './pages/NotificationPage';
import { FormAsyncPage } from './pages/FormAsyncPage';
import { DSLPage } from './pages/DSLPage';
import { GovernancePage } from './pages/GovernancePage';
import { RenderingPage } from './pages/RenderingPage';

// Shared components
import { ConfirmModal } from './components/ConfirmModal';
import { RuntimeStatePanel } from './components/RuntimeStatePanel';
import { DevToolsPanel } from './components/DevToolsPanel';

// ── Route definitions ──────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'Overview', label: 'Overview', icon: '◎', section: 'General' },
  { id: 'PageModule', label: 'Page Module', icon: '▤', section: 'Modules' },
  { id: 'ModalModule', label: 'Modal Module', icon: '◻', section: 'Modules' },
  { id: 'DrawerModule', label: 'Drawer Module', icon: '◨', section: 'Modules' },
  { id: 'Notifications', label: 'Notifications', icon: '◉', section: 'Modules' },
  { id: 'FormAsync', label: 'Form & Async', icon: '◈', section: 'Modules' },
  { id: 'DSL', label: 'Interaction DSL', icon: '⟡', section: 'API' },
  { id: 'Governance', label: 'Governance', icon: '⛊', section: 'API' },
  { id: 'Rendering', label: 'Rendering Layer', icon: '◧', section: 'Rendering' },
];

const PAGE_MAP: Record<string, React.ComponentType> = {
  Overview: OverviewPage,
  PageModule: PageModulePage,
  ModalModule: ModalModulePage,
  DrawerModule: DrawerModulePage,
  Notifications: NotificationPage,
  FormAsync: FormAsyncPage,
  DSL: DSLPage,
  Governance: GovernancePage,
  Rendering: RenderingPage,
};

// ── Content Router ─────────────────────────────
function ContentRouter() {
  const { currentPage } = usePage();
  const Component = PAGE_MAP[currentPage ?? 'Overview'] ?? OverviewPage;
  return <Component />;
}

// ── Left Navigation ────────────────────────────
function Navigation() {
  const { currentPage, mount, transition } = usePage();

  const handleNav = (pageId: string) => {
    mount(pageId);
    transition(pageId);
  };

  // Group nav items by section
  const sections = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <nav className="demo-nav">
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className="demo-nav__section">
          <div className="demo-nav__section-title">{section}</div>
          {items.map((item) => (
            <button
              key={item.id}
              className={`demo-nav__item ${currentPage === item.id ? 'demo-nav__item--active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="demo-nav__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

// ── Header ─────────────────────────────────────
function Header() {
  const state = useRuntimeState();

  return (
    <header className="demo-header">
      <span className="demo-header__title">PrismUI Runtime</span>
      <span className="demo-header__version">v0.3.0</span>
      <span className="demo-header__separator" />
      <div className="demo-header__status">
        <span>state v{state.version}</span>
      </div>
    </header>
  );
}

// ── Modal Layer ────────────────────────────────
function ModalLayer() {
  const { isOpen } = useModal();
  return <>{isOpen('confirm') && <ConfirmModal />}</>;
}

// ── Init: mount Overview as default page ───────
function InitPage() {
  const { mount, transition, currentPage } = usePage();

  useEffect(() => {
    if (!currentPage) {
      mount('Overview');
      transition('Overview');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// ── App ────────────────────────────────────────
export function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <InitPage />
      <div className="demo-layout">
        <Header />
        <Navigation />
        <main className="demo-content">
          <ContentRouter />
        </main>
        <RuntimeStatePanel />
        <ModalLayer />
        <DevToolsPanel />
      </div>
    </PrismUIProvider>
  );
}
