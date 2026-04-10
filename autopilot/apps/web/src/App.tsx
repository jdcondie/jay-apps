import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './pages/Login';
import { Header, type TabId } from './components/layout/Header';
import { SingleTask } from './components/tabs/SingleTask';
import { IntakeTab } from './components/tabs/IntakeTab';
import { ScannerTab } from './components/tabs/ScannerTab';
import { LibraryTab } from './components/tabs/LibraryTab';
import { PromptsTab } from './components/tabs/PromptsTab';
import { SkillsTab } from './components/tabs/SkillsTab';
import { PhoneTriggerTab } from './components/tabs/PhoneTriggerTab';
import type { Session } from '@supabase/supabase-js';
import styles from './App.module.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<TabId>('single');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className={styles.loading} />;
  if (!session) return <Login />;

  return (
    <div className={styles.app}>
      <Header
        activeTab={tab}
        onTabChange={setTab}
        stage="input"
        pinnedSkills={[]}
        injectedPrompt={null}
      />
      <main className={styles.main}>
        {tab === 'single'  && <SingleTask />}
        {tab === 'intake'  && <IntakeTab />}
        {tab === 'scanner' && <ScannerTab />}
        {tab === 'library' && <LibraryTab />}
        {tab === 'prompts' && <PromptsTab />}
        {tab === 'skills'  && <SkillsTab />}
        {tab === 'phone'   && <PhoneTriggerTab />}
      </main>
    </div>
  );
}
