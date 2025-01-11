import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeStampProps {
    timestamp: string;
    className?: string;
    showIcon?: boolean;
    extended?: boolean;
    text?: string;
    live?: boolean;
}

export const TimeStamp = ({
    timestamp,
    className,
    showIcon = true,
    extended = false,
    text,
    live = false
}: TimeStampProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (live) {
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [live]);

    return (
        <time
            dateTime={timestamp}
            className={`flex items-center gap-1 text-sm text-neutral-400 ${className}`}
        >
            {showIcon && <Clock size={16} />}
            {formatDistanceToNow(new Date(timestamp), {
                includeSeconds: true,
                addSuffix: true,
                locale: de
            })}
            {live && (
                <span className="text-sm text-neutral-400"></span>
            )}
            {extended && text && (
                <span className="text-sm text-neutral-400">{text}</span>
            )}
        </time>
    );
};
