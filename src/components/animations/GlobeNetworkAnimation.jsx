import React from 'react';
import styles from './GlobeNetworkAnimation.module.css';

const GlobeNetworkAnimation = () => {
    return (
        <div className={styles.container}>
            <div className={styles.particleSystem}>
                <div className={styles.orbitRing} />
                <div className={styles.satellite} />
            </div>

            <div className={styles.networkGlobe}>
                {/* Vertical Meridian Rings */}
                <div className={styles.ring}>
                    <div className={styles.node} style={{ top: '20%', left: '50%' }} />
                    <div className={styles.node} style={{ top: '80%', left: '50%' }} />
                </div>
                <div className={styles.ring}>
                    <div className={styles.node} style={{ top: '50%', left: '25%' }} />
                </div>
                <div className={styles.ring} />
                <div className={styles.ring}>
                    <div className={styles.node} style={{ top: '35%', left: '75%' }} />
                </div>
                <div className={styles.ring} />
                <div className={styles.ring} />

                {/* Horizontal Latitude Rings */}
                <div className={styles.ring} />
                <div className={styles.ring}>
                    <div className={styles.node} style={{ top: '50%', left: '0%' }} />
                    <div className={styles.node} style={{ top: '50%', left: '100%' }} />
                </div>
                <div className={styles.ring} />
                <div className={styles.ring} />
            </div>

            <div className={styles.overlay} />
        </div>
    );
};

export default GlobeNetworkAnimation;
