import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const CustomAlert = ({ 
  message, 
  type = 'info',
  isVisible,
  onClose, 
  duration = 5000,
  title = null,
  position = 'top-right'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      console.log('✅ CustomAlert triggered:', message);
      setIsAnimating(true);
      setIsExiting(false);
      
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, duration, message]);

  const handleClose = () => {
    setIsExiting(true);
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getAlertStyles = () => {
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const baseStyles = `fixed ${positionStyles[position]} z-50 max-w-sm w-full transition-all duration-300 ease-out`;
    
    const typeStyles = {
      'success': 'bg-gradient-to-r from-green-500/95 to-emerald-600/95 border border-green-400/50 shadow-green-500/25',
      'error': 'bg-gradient-to-r from-red-500/95 to-red-600/95 border border-red-400/50 shadow-red-500/25',
      'warning': 'bg-gradient-to-r from-yellow-500/95 to-orange-600/95 border border-yellow-400/50 shadow-yellow-500/25',
      'info': 'bg-gradient-to-r from-blue-500/95 to-purple-600/95 border border-blue-400/50 shadow-blue-500/25'
    };

    return `${baseStyles} ${typeStyles[type]} shadow-2xl`;
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 text-white drop-shadow-sm" };
    const icons = {
      'success': <CheckCircle {...iconProps} />,
      'error': <XCircle {...iconProps} />,
      'warning': <AlertCircle {...iconProps} />,
      'info': <Info {...iconProps} />
    };
    return icons[type] || icons['info'];
  };

  const getAnimationClasses = () => {
    if (!isVisible) return 'opacity-0 scale-95 translate-y-2';
    
    const slideDirection = position.includes('right') ? 'translate-x-full' : 
                          position.includes('left') ? '-translate-x-full' : 
                          'translate-y-2';
    
    if (isExiting) {
      return `opacity-0 scale-95 ${slideDirection}`;
    }
    
    return isAnimating ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 
                        `opacity-0 scale-95 ${slideDirection}`;
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${getAlertStyles()} ${getAnimationClasses()}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="backdrop-blur-md bg-black/20 rounded-xl shadow-2xl p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-bold text-white mb-1 drop-shadow-sm">
                {title}
              </h4>
            )}
            <p className="text-sm text-white/95 leading-relaxed drop-shadow-sm">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-all duration-200 p-1.5 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enhanced Progress bar */}
        {duration > 0 && (
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="h-full bg-gradient-to-r from-white/70 to-white/90 rounded-full transition-all ease-linear shadow-sm"
              style={{ 
                animation: `shrink ${duration}ms linear forwards`,
                width: '100%'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Enhanced Alert Manager ----------

class AlertManager {
  constructor() {
    this.alerts = [];
    this.listeners = [];
    this.maxAlerts = 5;
  }

  subscribe(listener) {
    console.log('🟢 Subscribing to alertManager');
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    console.log('📢 Notifying listeners of alert update');
    this.listeners.forEach(listener => listener(this.alerts));
  }

  show(message, type = 'info', options = {}) {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration ?? 5000,
      position: options.position ?? 'top-right',
      isVisible: true,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📨 Showing ${type} alert:`, message);
    
    // Remove oldest alert if we've reached the limit
    if (this.alerts.length >= this.maxAlerts) {
      this.alerts = this.alerts.slice(1);
    }
    
    this.alerts = [...this.alerts, alert];
    this.notify();
    return id;
  }

  success(msg, options = {}) { return this.show(msg, 'success', options); }
  error(msg, options = {}) { return this.show(msg, 'error', options); }
  warning(msg, options = {}) { return this.show(msg, 'warning', options); }
  info(msg, options = {}) { return this.show(msg, 'info', options); }

  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random();
      const alert = {
        id,
        message,
        type: 'confirm',
        title: options.title || 'Confirm Action',
        isVisible: true,
        onConfirm: () => {
          console.log('✅ Confirmed');
          this.remove(id);
          resolve(true);
        },
        onCancel: () => {
          console.log('❌ Cancelled');
          this.remove(id);
          resolve(false);
        }
      };
      console.log('⚠️ Showing confirmation dialog');
      this.alerts = [...this.alerts, alert];
      this.notify();
    });
  }

  remove(id) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    this.notify();
  }

  clear() {
    this.alerts = [];
    this.notify();
  }
}

const alertManager = new AlertManager();

// ---------- Enhanced Confirm Component ----------

const CustomConfirm = ({ alert }) => {
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    console.log('🔔 CustomConfirm mounted');
    if (alert.isVisible) {
      // Slight delay for smooth entrance
      setTimeout(() => setVisible(true), 10);
    }
  }, [alert.isVisible]);

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => alert.onConfirm(), 100);
    }, 200);
  };

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => alert.onCancel(), 100);
    }, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!alert.isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        visible && !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full transform transition-all duration-300 ${
          visible && !isExiting ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{alert.title}</h3>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed text-base">
            {alert.message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Enhanced Container Component ----------

const AlertContainer = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    console.log(`🚀 AlertContainer [${id}] mounted`);
    const unsubscribe = alertManager.subscribe(setAlerts);
    return () => {
      console.log(`🔌 AlertContainer [${id}] unsubscribed`);
      unsubscribe();
    };
  }, []);

  // Group alerts by position
  const alertsByPosition = alerts.reduce((acc, alert) => {
    const position = alert.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(alert);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(alertsByPosition).map(([position, positionAlerts]) => (
        <div key={position} className="alert-container">
          {positionAlerts.map(alert =>
            alert.type === 'confirm' ? (
              <CustomConfirm key={alert.id} alert={alert} />
            ) : (
              <CustomAlert
                key={alert.id}
                message={alert.message}
                type={alert.type}
                title={alert.title}
                position={position}
                isVisible={alert.isVisible}
                duration={alert.duration}
                onClose={() => alertManager.remove(alert.id)}
              />
            )
          )}
        </div>
      ))}
    </>
  );
};

export { alertManager, AlertContainer };