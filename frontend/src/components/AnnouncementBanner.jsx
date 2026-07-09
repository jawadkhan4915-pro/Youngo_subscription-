import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import api from '../services/api.js';
import './components.css';

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/settings/announcements');
        if (res.data?.success && res.data.data.length > 0) {
          const activeAnn = res.data.data[0];
          // Check if user has already dismissed this specific announcement
          const dismissedId = sessionStorage.getItem(`dismissed_ann_${activeAnn._id}`);
          if (!dismissedId) {
            setAnnouncement(activeAnn);
            setVisible(true);
          }
        }
      } catch (err) {
        console.error('Failed to load announcements', err);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      sessionStorage.setItem(`dismissed_ann_${announcement._id}`, 'true');
    }
    setVisible(false);
  };

  if (!visible || !announcement) return null;

  return (
    <div className="announcement-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '2rem' }}>
        <Megaphone size={16} />
        <span>
          <strong>{announcement.title}</strong>: {announcement.message}
        </span>
      </div>
      <button className="banner-close" onClick={handleDismiss} aria-label="Dismiss banner">
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
