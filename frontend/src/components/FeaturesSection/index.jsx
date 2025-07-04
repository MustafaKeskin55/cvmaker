import React from 'react';
import styles from './styles.module.css';

const FeaturesSection = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>{data.title}</h2>
          {data.subtitle && <p>{data.subtitle}</p>}
        </div>

        <div className={styles.featuresGrid}>
          {data.features.map((feature) => (
            <div className={styles.featureCard} key={feature.id}>
              <div className={styles.featureIcon}>
                <i className={feature.icon}></i>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 