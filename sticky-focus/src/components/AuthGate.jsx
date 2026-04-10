import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react'

export function AuthGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div style={{
          minHeight:'100vh', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
          padding:24, gap:32,
        }}>
          <div style={{textAlign:'center'}}>
            <div style={{
              width:72, height:72, borderRadius:20, margin:'0 auto 16px',
              background:'linear-gradient(135deg,#FECA57,#FF6B6B)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:36, boxShadow:'0 8px 32px rgba(254,202,87,.45)',
            }}>📌</div>
            <h1 style={{margin:'0 0 6px',fontSize:34,fontWeight:900,color:'#fff',letterSpacing:-1}}>
              Sticky<span style={{color:'#FECA57'}}>Focus</span>
            </h1>
            <p style={{color:'rgba(255,255,255,.45)',fontSize:15,margin:0}}>
              Break big goals into tiny wins — one sticky at a time.
            </p>
          </div>
          <SignIn
            appearance={{
              variables: {
                colorPrimary:'#FECA57', colorText:'#fff',
                colorBackground:'rgba(255,255,255,.07)',
                colorInputBackground:'rgba(255,255,255,.1)',
                colorInputText:'#fff', borderRadius:'14px',
              },
              elements: {
                card: {
                  background:'rgba(255,255,255,.06)',
                  border:'1px solid rgba(255,255,255,.12)',
                  backdropFilter:'blur(20px)',
                  boxShadow:'0 24px 64px rgba(0,0,0,.4)',
                },
                formButtonPrimary: {
                  background:'linear-gradient(135deg,#FECA57,#FF9F43)',
                  color:'#1a0f00', fontWeight:800,
                },
                footerActionLink: { color:'#FECA57' },
              },
            }}
          />
        </div>
      </SignedOut>
    </>
  )
}
