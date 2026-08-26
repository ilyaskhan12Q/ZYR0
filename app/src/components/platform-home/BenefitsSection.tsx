// @ts-nocheck
import React from 'react';

export default function BenefitsSection() {
  return (
    <section className="framer-1sfarjp" data-framer-name="Benefits" id="benefits">
      {/* Video Container */}
      <div className="framer-v8c9yh" data-framer-name="Video Container">
        <div className="ssr-variant hidden-jueq9p">
          <div className="framer-8go5sv-container" style={{willChange:'transform',opacity:0,transform:'translateX(-50%) translateY(-30px) scale(0.8)'}}>
            <video src="https://framerusercontent.com/assets/vdo7vl69SSTV5arCTIp5d25ciuQ.mp4" loop preload="none" muted playsInline style={{cursor:'auto',width:'100%',height:'100%',borderRadius:'0px',display:'block',objectFit:'fill',backgroundColor:'rgb(0, 0, 0)',objectPosition:'50% 50%'}} />
          </div>
        </div>
        <div className="ssr-variant hidden-19w5p2z hidden-72rtr7">
          <div className="framer-8go5sv-container" style={{willChange:'transform',opacity:0,transform:'translateY(-30px) scale(0.8)'}}>
            <video src="https://framerusercontent.com/assets/vdo7vl69SSTV5arCTIp5d25ciuQ.mp4" loop preload="none" muted playsInline style={{cursor:'auto',width:'100%',height:'100%',borderRadius:'0px',display:'block',objectFit:'fill',backgroundColor:'rgb(0, 0, 0)',objectPosition:'50% 50%'}} />
          </div>
        </div>
        <div className="framer-hfxxg3" data-framer-name="Radial Gradient" />
      </div>

      {/* Main Container */}
      <div className="framer-z7ypqn" data-framer-name="Main Container">
        <div className="framer-6ar3wa" data-framer-name="Container" style={{willChange:'transform',opacity:0,transform:'translateY(50px)'}}>
          {/* Tag */}
          <div className="framer-81wl5o-container">
            <div className="framer-PBbng framer-kCvBu framer-d61g4f framer-v-d61g4f" data-framer-name="Tag">
              <div className="framer-4k92sv-container"><div style={{display:'contents'}} /></div>
              <div className="framer-1b2b1yy" data-framer-name="Text" style={{outline:'none',display:'flex',flexDirection:'column',justifyContent:'flex-start',flexShrink:0,'--framer-paragraph-spacing':'0px',transform:'none'}}>
                <p className="framer-text framer-styles-preset-jycf3n">Benefits</p>
              </div>
            </div>
          </div>
          {/* Heading */}
          <div className="framer-1549rfq" data-framer-name="Heading" style={{outline:'none',display:'flex',flexDirection:'column',justifyContent:'flex-start',flexShrink:0,transform:'none'}}>
            <h2 className="framer-text framer-styles-preset-1bwurf2" style={{"--framer-text-alignment":"center"}}>Unlock Your Team's Potential</h2>
          </div>
          {/* Paragraph */}
          <div className="framer-qa9ccd" data-framer-name="Paragraph" style={{outline:'none',display:'flex',flexDirection:'column',justifyContent:'flex-start',flexShrink:0,transform:'none'}}>
            <p className="framer-text framer-styles-preset-jycf3n" style={{"--framer-text-alignment":"center"}}>Maximize efficiency, enhance collaboration, and achieve project goals with ZYR0&apos;s powerful management tools.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="framer-1mj2g39" data-framer-name="Container">
          {[
            { number: '76%', label: 'Pro Users' },
            { number: '12M+', label: 'Tasks Organized' },
            { number: '600+', label: 'Team Members' },
          ].map((stat, i) => (
            <div key={i} className="framer-840l9" data-framer-name="Sub Container" style={{willChange:'transform',opacity:0,transform:'translateY(50px)'}}>
              <div className="framer-1ofbbuw" data-framer-name="Number" style={{outline:'none',display:'flex',flexDirection:'column',justifyContent:'flex-start',flexShrink:0,transform:'none'}}>
                <h2 className="framer-text framer-styles-preset-1bwurf2" style={{"--framer-text-color":"rgb(0, 0, 0)"}}>
                  <span data-text-fill="true" style={{backgroundImage:'linear-gradient(498deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 100%)'}} className="framer-text">{stat.number}</span>
                </h2>
              </div>
              <div className="framer-1htx2j3" data-framer-name="Sub Container">
                <div className="framer-x2es5" data-framer-name="Text" style={{outline:'none',display:'flex',flexDirection:'column',justifyContent:'flex-end',flexShrink:0,transform:'none'}}>
                  <p className="framer-text framer-styles-preset-jycf3n" style={{"--framer-text-color":"var(--token-8d7e0ee3-cbeb-4f0c-8fae-b1180c2c0a4a, rgb(173, 176, 183))"}}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
