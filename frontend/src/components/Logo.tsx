interface LogoProps {
    className?: string;
    size?: number;
}

export default function Logo({ className = '', size = 40 }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
            </defs>
            {/* Stylized E made of 3 horizontal bars */}
            <rect x="15" y="15" width="70" height="16" rx="4" fill="url(#logoGradient)" />
            <rect x="15" y="42" width="50" height="16" rx="4" fill="url(#logoGradient)" />
            <rect x="15" y="69" width="70" height="16" rx="4" fill="url(#logoGradient)" />
        </svg>
    );
}
