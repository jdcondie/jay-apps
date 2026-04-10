import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import styles from './Login.module.css';

export function Login() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>AP</span>
          <span className={styles.logoText}>AutoPilot</span>
        </div>
        <p className={styles.tagline}>Automation blueprints. Built in minutes.</p>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand:         '#00ff87',
                  brandAccent:   '#00e87a',
                  inputBackground: '#0f0f0f',
                  inputBorder:   '#1e1e1e',
                  inputText:     '#e8e8e8',
                  inputPlaceholder: '#555',
                },
                fonts: {
                  bodyFontFamily: `'IBM Plex Mono', monospace`,
                  buttonFontFamily: `'IBM Plex Mono', monospace`,
                  inputFontFamily: `'IBM Plex Mono', monospace`,
                },
                borderWidths: { buttonBorderWidth: '1px', inputBorderWidth: '1px' },
                radii: { borderRadiusButton: '4px', inputBorderRadius: '4px' },
              },
            },
          }}
          providers={[]}
        />
      </div>
    </div>
  );
}
