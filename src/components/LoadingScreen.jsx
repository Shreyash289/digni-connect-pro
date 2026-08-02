export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.4;
          }
          50% { 
            transform: translate(30px, -40px); 
            opacity: 0.6;
          }
        }
        
        @keyframes orb-float-2 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.3;
          }
          50% { 
            transform: translate(-40px, 30px); 
            opacity: 0.5;
          }
        }
        
        @keyframes orb-float-3 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.35;
          }
          50% { 
            transform: translate(35px, 25px); 
            opacity: 0.55;
          }
        }
        
        @keyframes fadeInTitle {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .orb-1 { animation: orb-float-1 8s ease-in-out infinite; }
        .orb-2 { animation: orb-float-2 10s ease-in-out infinite; }
        .orb-3 { animation: orb-float-3 9s ease-in-out infinite; }
        .title-fade { animation: fadeInTitle 1s ease-out 0.5s both; }
        .pulse-text { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C1F3F 0%, #1a3a52 100%)',
        overflow: 'hidden'
      }}>
        {/* Orb 1 - Blue */}
        <div style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.6), rgba(37, 99, 235, 0.1))',
          filter: 'blur(40px)',
          top: '15%',
          left: '10%',
          className: 'orb-1'
        }} className="orb-1" />

        {/* Orb 2 - Teal */}
        <div style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.5), rgba(13, 148, 136, 0.05))',
          filter: 'blur(35px)',
          bottom: '20%',
          right: '12%',
          className: 'orb-2'
        }} className="orb-2" />

        {/* Orb 3 - Blue-Teal */}
        <div style={{
          position: 'absolute',
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(2, 132, 199, 0.4), rgba(2, 132, 199, 0.05))',
          filter: 'blur(30px)',
          top: '50%',
          right: '8%',
          className: 'orb-3'
        }} className="orb-3" />

        {/* Content */}
        <div style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          color: '#fff'
        }}>
          {/* Logo Circle */}
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.2)',
            border: '2px solid rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            margin: '0 auto 20px',
            className: 'title-fade'
          }} className="title-fade">
            C
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: 'Plus Jakarta Sans',
            margin: '0 0 8px 0',
            letterSpacing: '0.05em',
            className: 'title-fade'
          }} className="title-fade">
            CAREVIA
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 30px 0',
            fontWeight: 500,
            className: 'title-fade'
          }} className="title-fade">
            Survivor Repository
          </p>

          {/* Loading Bar */}
          <div style={{
            width: 200,
            height: 2,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 1,
            overflow: 'hidden',
            margin: '0 auto'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #2563EB, #0D9488)',
              borderRadius: 1,
              animation: 'pulse-subtle 2s ease-in-out infinite',
              width: '100%',
              className: 'pulse-text'
            }} className="pulse-text" />
          </div>

          {/* Loading Text */}
          <p style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 16,
            letterSpacing: '0.05em',
            className: 'pulse-text'
          }} className="pulse-text">
            Loading...
          </p>
        </div>
      </div>
    </>
  )
}