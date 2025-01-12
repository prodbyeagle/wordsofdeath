/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Props for the TimeStamp component.
 */
interface TimeStampProps {
    /**
     * The timestamp to display, in ISO 8601 string format.
     */
    timestamp: string;

    /**
     * Additional class names for custom styling.
     */
    className?: string;

    /**
     * Whether to show the clock icon next to the timestamp. Default: `true`.
     */
    showIcon?: boolean;

    /**
     * Whether to show additional text if provided. Default: `false`.
     */
    extended?: boolean;

    /**
     * Optional text to display when `extended` is enabled.
     */
    text?: string;

    /**
     * Whether the timestamp should update live (every 10 seconds). Default: `false`.
     */
    live?: boolean;
}

/**
 * A component to display a formatted timestamp with optional live updates, an icon, and extended text.
 *
 * @param timestamp The timestamp to display, formatted relative to the current time.
 * @param className Optional additional classes for styling.
 * @param showIcon Whether to show a clock icon next to the timestamp. Default: `true`.
 * @param extended Whether to show additional text if provided. Default: `false`.
 * @param text Optional additional text to display when `extended` is enabled.
 * @param live Whether to update the timestamp dynamically (every 10 seconds). Default: `false`.
 * @returns A time element displaying a human-readable timestamp.
 */
export const TimeStamp = ({
    timestamp,
    className,
    showIcon = true,
    extended = false,
    text,
    live = false,
}: TimeStampProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (live) {
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 10000);

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
                locale: de,
            })}

            {live && <span className="text-sm text-neutral-400"></span>}
            {extended && text && (
                <span className="text-sm text-neutral-400">{text}</span>
            )}
        </time>
    );
};
