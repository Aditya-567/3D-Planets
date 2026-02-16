import React, { useState, useEffect } from 'react';

const LogoWithRotatingText = ({
    theme = "dark",
    top,
    bottom,
    left,
    right,
    size = 96 // Default size in pixels (equivalent to w-24 h-24)
}) => {
    const logos = [
        "logo.svg",   // Default
        "logo1.svg",  // 2nd image
        "logo2.svg",  // 3rd image
        "logo3.svg",  // 4th image
        "logo4.svg",  // 5th image
        "logo5.svg",  // 6th image
    ];

    // Repeat text to fill the circle
    const text = "COSMOS • COSMOS • ";
    const characters = text.split("");
    const angle = 360 / characters.length;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    // Dynamic measurements based on 'size' prop
    const radius = size / 2;
    const logoSize = size * 0.58; // Logo is roughly 58% of the total container

    // Define colors based on the theme prop
    const isLight = theme === "light";
    const textColor = isLight ? "text-black" : "text-white";
    const imageBg = isLight ? "bg-white" : "bg-black";

    // Determine positioning styles
    // If no specific position is provided, default to top-8 left-8 (as per original design)
    const hasCustomPosition = top !== undefined || bottom !== undefined || left !== undefined || right !== undefined;
    const containerStyle = {
        width: `${size}px`,
        height: `${size}px`,
        top: top,
        bottom: bottom,
        left: left,
        right: right,
    };
    const defaultPositionClass = hasCustomPosition ? "fixed" : "fixed top-8 left-8";

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % logos.length);
                setIsFlipping(false);
            }, 300);
        }, 3000);
        return () => clearInterval(interval);
    }, [logos.length]);

    return (
        <div
            className={`${defaultPositionClass} z-[100] pointer-events-none flex items-center justify-center`}
            style={containerStyle}
        >
            {/* Image with dynamic background color and size */}
            <img
                src={logos[currentIndex]}
                alt="Planet"
                className={`
                    absolute rounded-full z-20 object-cover
                    transition-transform duration-300 ease-in-out
                    ${imageBg} 
                `}
                style={{
                    width: `${logoSize}px`,
                    height: `${logoSize}px`,
                    transform: isFlipping ? 'rotateY(90deg)' : 'rotateY(0deg)'
                }}
            />

            {/* Rotating Text Container */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite] w-full h-full z-10">
                <h1 className="w-full h-full relative" aria-label="COSMOS">
                    {characters.map((char, i) => (
                        <span
                            key={i}
                            className={`absolute left-1/2 top-0 font-black text-xs tracking-tighter origin-bottom ${textColor}`}
                            style={{
                                // 1. Rotate to angle
                                // 2. Center horizontally (translateX -50%)
                                transform: `rotate(${i * angle}deg) translateX(-50%)`,
                                // 3. Set the pivot point to the bottom of the span (which matches the radius)
                                transformOrigin: `0 ${radius}px`,
                                // 4. Height equals the radius, pushing the text to the edge
                                height: `${radius}px`,
                                fontSize: `${size * 0.125}px` // Optional: Scale font size with container
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default LogoWithRotatingText;