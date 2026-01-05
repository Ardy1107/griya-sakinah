import { useState, useRef } from 'react';
import { Info } from 'lucide-react';
import './InfoTooltip.css';

const InfoTooltip = ({ text, position = 'right' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const triggerRef = useRef(null);

    const calculatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const padding = 10;

        let style = {};

        switch (position) {
            case 'right':
                style = {
                    left: `${rect.right + padding}px`,
                    top: `${rect.top + rect.height / 2}px`,
                    transform: 'translateY(-50%)'
                };
                break;
            case 'left':
                style = {
                    right: `${window.innerWidth - rect.left + padding}px`,
                    top: `${rect.top + rect.height / 2}px`,
                    transform: 'translateY(-50%)'
                };
                break;
            case 'top':
                style = {
                    left: `${rect.left + rect.width / 2}px`,
                    bottom: `${window.innerHeight - rect.top + padding}px`,
                    transform: 'translateX(-50%)'
                };
                break;
            case 'bottom':
            default:
                style = {
                    left: `${rect.left + rect.width / 2}px`,
                    top: `${rect.bottom + padding}px`,
                    transform: 'translateX(-50%)'
                };
                break;
        }

        setTooltipStyle(style);
    };

    const handleMouseEnter = () => {
        calculatePosition();
        setIsVisible(true);
    };

    return (
        <div className="info-tooltip-wrapper">
            <button
                ref={triggerRef}
                type="button"
                className="info-tooltip-trigger"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => {
                    if (!isVisible) {
                        calculatePosition();
                    }
                    setIsVisible(!isVisible);
                }}
                aria-label="Informasi"
            >
                <Info size={14} />
            </button>
            {isVisible && (
                <div className={`info-tooltip-content ${position}`} style={tooltipStyle}>
                    <span>{text}</span>
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;
