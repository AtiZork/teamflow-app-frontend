// src/pages/CheckInOut.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
    FiClock,
    FiMapPin,
    FiWifi,
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiAlertCircle,
    FiCoffee,
    FiSun,
    FiMeh,
    FiUser,
    FiUsers
} from "react-icons/fi";
import { format } from "date-fns";
import styles from "../styles/CheckInOut.module.css";
import Layout from "../components/layout/Layout.jsx";
import Header from "../components/layout/Header.jsx";
import {
    checkIn,
    checkOut,
    getTodayStatus,
    startBreak,
    endBreak,
    getWorkLocationOptions,
    getBreakTypeOptions,
    formatAttendanceTime,
    calculateProductiveHours as calculateProdHours
} from "../api/attendance.js";
import HoursApi from "../api/hoursApi.js";

const CheckInOut = () => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [totalHours, setTotalHours] = useState("00:00");
    const [workLocation, setWorkLocation] = useState("Office");
    const [locationOptions] = useState(["Office", "Remote", "Client Site", "Field Work"]);

    const [todayDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [breakTime, setBreakTime] = useState("00:00");
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakHistory, setBreakHistory] = useState([]);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState(null);

    // Break types with colors and icons
    const [breakTypes] = useState([
        {
            id: 'break',
            name: 'Break',
            color: '#3B82F6',
            icon: <FiClock />,
            description: 'Short break'
        },
        {
            id: 'namaz',
            name: 'Namaz',
            color: '#10B981',
            icon: <FiSun />,
            description: 'Prayer time'
        },
        {
            id: 'lunch',
            name: 'Lunch',
            color: '#F59E0B',
            icon: <FiMeh />,
            description: 'Meal break'
        },
        {
            id: 'tea',
            name: 'Tea/Coffee',
            color: '#8B5CF6',
            icon: <FiCoffee />,
            description: 'Refreshment'
        },
        {
            id: 'personal',
            name: 'Personal',
            color: '#EC4899',
            icon: <FiUser />,
            description: 'Personal time'
        }
    ]);

    const [selectedBreakType, setSelectedBreakType] = useState('break');
    const [activeBreak, setActiveBreak] = useState(null);
    const [breakDuration, setBreakDuration] = useState("00:00");

    // Weekly summary state
    const [weeklyTotalHours, setWeeklyTotalHours] = useState("0.0");
    const [weeklyAvgDaily, setWeeklyAvgDaily] = useState("0.0");
    const [weeklyAttendance, setWeeklyAttendance] = useState("0%");

    // Helper: Fix Timezone Issue - Fix for backend time showing UTC+Offset when it should be Local
    // Helper: Parse backend time (handles both ISO strings and legacy HH:MM)
    const parseBackendTime = (timeStr, isCheckOut = false) => {
        if (!timeStr) return null;

        try {
            // Handle ISO 8601 format (e.g., 2025-12-15T08:01:00Z)
            // This is the preferred format as it handles timezones correctly
            if (timeStr.includes('T') || timeStr.includes('Z')) {
                return new Date(timeStr);
            }

            // Legacy fallback for HH:MM format
            // Assumes the time is for "today"
            const date = new Date();
            const [hours, minutes] = timeStr.split(':').map(Number);
            date.setHours(hours, minutes, 0, 0);

            // Note: HH:MM format is ambiguous regarding timezone. 
            // If the backend sent UTC as HH:MM, this will be interpreted as Local HH:MM
            // which causes the bug we are fixing. 
            // But we keep this for backward compatibility if backend sends local HH:MM.

            return date;
        } catch (error) {
            console.error("Error parsing time:", timeStr, error);
            return null;
        }
    };

    // Fetch weekly summary
    const fetchWeeklySummary = async () => {
        try {
            const result = await HoursApi.getWeeklyHours();
            if (result.success && result.data) {
                const data = result.data;

                // Keep total hours in HH:MM format (not decimal)
                const totalHoursStr = data.total_hours || "00:00";
                setWeeklyTotalHours(totalHoursStr);

                // Keep average daily in HH:MM format (not decimal)
                const avgDailyStr = data.average_daily_hours || "00:00";
                setWeeklyAvgDaily(avgDailyStr);

                // Show attendance as "X/5 days" format (Monday-Friday work week)
                const daysWorked = data.working_days || 0;
                const workingDaysInWeek = 5; // Monday to Friday
                setWeeklyAttendance(`${daysWorked}/5 days`);
            }
        } catch (error) {
            console.error("Error fetching weekly summary:", error);
        }
    };

    // Load today's status on component mount
    useEffect(() => {
        fetchTodayStatus();
        fetchWeeklySummary();
        getCurrentLocation(); // Fetch fresh location on mount
    }, []);

    // Fetch today's attendance status with timezone fixes
    const fetchTodayStatus = async () => {
        try {
            setIsLoading(true);
            const data = await getTodayStatus();
            setAttendanceData(data);

            // Restore current location from API
            if (data) {
                const lat = typeof data.latitude === "number" ? data.latitude : null;
                const lon = typeof data.longitude === "number" ? data.longitude : null;
                const addr = data.address || data.current_location;

                if (addr || (lat && lon)) {
                    setCurrentLocation({
                        latitude: lat,
                        longitude: lon,
                        address: addr
                    });
                }
            }

            console.log("DEBUG: Received data from API:", {
                is_checked_in: data.is_checked_in,
                check_in_time: data.check_in_time,
                check_out_time: data.check_out_time
            });

            // Handle check-in/check-out status with timezone fixes
            if (data.is_checked_in) {
                console.log("Setting isCheckedIn to TRUE");
                setIsCheckedIn(true);
                setCheckOutTime(null);

                if (data.check_in_time) {
                    const correctedTime = parseBackendTime(data.check_in_time);
                    if (correctedTime) {
                        setCheckInTime(correctedTime);
                        console.log("Set checkInTime:", correctedTime);
                    }
                }
            } else {
                // Not checked in
                console.log("Setting isCheckedIn to FALSE");
                setIsCheckedIn(false);

                // Set check-in time if available (for history)
                if (data.check_in_time) {
                    const correctedTime = parseBackendTime(data.check_in_time);
                    if (correctedTime) setCheckInTime(correctedTime);
                }

                // Handle check-out time
                if (data.check_out_time) {
                    const correctedOutTime = parseBackendTime(data.check_out_time, true);
                    if (correctedOutTime) {
                        setCheckOutTime(correctedOutTime);
                    }
                } else {
                    setCheckOutTime(null);
                }
            }

            // Update break status
            if (data.current_break) {
                const breakType = breakTypes.find(bt => bt.id === data.current_break.break_type);
                let breakStartTime = new Date(data.current_break.start_time);

                // Fix timezone for break start time if needed
                if (breakStartTime > new Date()) {
                    breakStartTime = new Date(breakStartTime.getTime() + (new Date().getTimezoneOffset() * 60000));
                }

                setActiveBreak({
                    id: data.current_break.id,
                    type: data.current_break.break_type,
                    name: breakType?.name || 'Break',
                    color: breakType?.color || '#3B82F6',
                    icon: breakType?.icon || <FiClock />,
                    description: breakType?.description || 'Break',
                    startTime: breakStartTime,
                    endTime: null,
                    duration: "00:00"
                });
                setIsOnBreak(true);
            } else {
                setActiveBreak(null);
                setIsOnBreak(false);
            }

            // Load break history with timezone fixes
            if (data.today_breaks && Array.isArray(data.today_breaks)) {
                const formattedBreaks = data.today_breaks.map(breakItem => {
                    const breakType = breakTypes.find(bt => bt.id === breakItem.break_type);
                    let startTime = new Date(breakItem.start_time);
                    let endTime = breakItem.end_time ? new Date(breakItem.end_time) : null;

                    // Fix timezone skew
                    const now = new Date();
                    if (startTime > now) {
                        startTime = new Date(startTime.getTime() + (now.getTimezoneOffset() * 60000));
                    }
                    if (endTime && endTime > now) {
                        endTime = new Date(endTime.getTime() + (now.getTimezoneOffset() * 60000));
                    }

                    // Calculate duration
                    let duration = "00:00";
                    if (endTime && startTime) {
                        const diffMs = endTime - startTime;
                        const minutes = Math.floor(diffMs / 60000);
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        duration = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                    }

                    return {
                        id: breakItem.id,
                        type: breakItem.break_type,
                        name: breakType?.name || 'Break',
                        color: breakType?.color || '#3B82F6',
                        icon: breakType?.icon || <FiClock />,
                        description: breakType?.description || 'Break',
                        startTime: startTime,
                        endTime: endTime,
                        duration: duration
                    };
                }).filter(item => item !== null);
                setBreakHistory(formattedBreaks);
            }

            // Build session history with corrected times
            const sessions = [];
            const cin = data.check_in_time ? parseBackendTime(data.check_in_time) : null;
            const cout = data.check_out_time ? parseBackendTime(data.check_out_time) : null;

            if (cin) {
                sessions.push({
                    id: 1,
                    type: "check-in",
                    time: cin,
                    location: data.current_location || workLocation
                });
            }
            if (cout) {
                sessions.push({
                    id: 2,
                    type: "check-out",
                    time: cout,
                    totalHours: data.total_hours || "00:00",
                    breakTime: data.total_break_time || "00:00"
                });
            }
            setSessionHistory(sessions);

            // Update total hours - ALWAYS use backend value (backend is source of truth)
            if (data.total_hours !== undefined && data.total_hours !== null) {
                setTotalHours(data.total_hours);
            } else {
                setTotalHours("00:00");
            }

            // Update break time - ALWAYS use backend value
            if (data.break_time !== undefined && data.break_time !== null) {
                setBreakTime(data.break_time);
            } else {
                setBreakTime("00:00");
            }

        } catch (error) {
            console.error("Error fetching today's status:", error);
            // Silently fail - user might not be checked in yet
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-update current time
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll backend for live updates when checked in (backend is source of truth)
    useEffect(() => {
        let interval;
        if (isCheckedIn && !checkOutTime) {
            // Fetch updated status every 10 seconds when checked in
            interval = setInterval(() => {
                fetchTodayStatus();
            }, 10000); // Poll every 10 seconds for live update
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCheckedIn, checkOutTime]);

    // Calculate active break duration
    useEffect(() => {
        if (activeBreak) {
            const interval = setInterval(() => {
                const now = new Date();
                const start = new Date(activeBreak.startTime);
                const diffMs = now - start;

                if (diffMs >= 0) {
                    const diffMins = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMins / 60);
                    const minutes = diffMins % 60;
                    setBreakDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [activeBreak]);

    // Get current location. Returns a Promise that resolves to the location object or null.
    const getCurrentLocation = async (isManual = false) => {
        if (!navigator.geolocation) {
            if (isManual) toast.error("Geolocation is not supported by your browser");
            return null;
        }

        // Check permissions first
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                if (result.state === 'denied') {
                    console.warn("Geolocation permission denied.");
                    if (isManual) {
                        toast.error("Location access is blocked. Please enable location permissions.", {
                            duration: 5000,
                            icon: '🚫'
                        });
                    }
                    return null;
                }
            }
        } catch (e) {
            // Ignore permission query error
        }

        return new Promise((resolve) => {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            address = data.display_name;
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                    }

                    const loc = {
                        latitude,
                        longitude,
                        address
                    };

                    setCurrentLocation(loc);
                    setIsLoadingLocation(false);
                    if (isManual) {
                        toast.success("Location updated");
                    }
                    resolve(loc);
                },
                (error) => {
                    console.warn("Location access denied or failed:", error.message);
                    setIsLoadingLocation(false);

                    if (error.code === 1 && isManual) {
                        toast.error("Please allow location access to track attendance.", {
                            duration: 4000
                        });
                    } else if (isManual) {
                        toast.error(`Location error: ${error.message}`);
                    }

                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );
        });
    };

    // Handle check in
    const handleCheckIn = async () => {
        if (!workLocation) {
            alert("Please select a work location");
            return;
        }

        try {
            setIsLoading(true);

            // Prepare check-in data
            const checkInData = {
                location: workLocation,
                notes: `Checked in at ${workLocation}`,
            };

            // Add location if available
            if (currentLocation) {
                checkInData.latitude = currentLocation.latitude;
                checkInData.longitude = currentLocation.longitude;
                checkInData.address = currentLocation.address;
            } else {
                // Get location if not already available
                const loc = await getCurrentLocation();
                if (loc) {
                    checkInData.latitude = loc.latitude;
                    checkInData.longitude = loc.longitude;
                    checkInData.address = loc.address;
                }
            }

            // Call API
            await checkIn(checkInData);

            // Refresh status from backend (single source of truth)
            await fetchTodayStatus();
            await fetchWeeklySummary();

            toast.success("Successfully checked in!");

        } catch (error) {
            console.error("Error checking in:", error);
            toast.error(`Failed to check in: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle check out
    const handleCheckOut = async () => {
        if (!isCheckedIn) {
            toast.error("You need to check in first!");
            return;
        }

        // End any active break before checking out
        if (activeBreak) {
            try {
                await endBreak();
            } catch (error) {
                console.error("Error ending break before checkout:", error);
            }
        }

        try {
            setIsLoading(true);

            // Prepare check-out data
            const checkOutData = {
                notes: `Checked out from ${workLocation}`,
            };

            // Call API
            await checkOut(checkOutData);

            // Refresh status from backend (single source of truth)
            await fetchTodayStatus();
            await fetchWeeklySummary();

            toast.success("Successfully checked out!");

        } catch (error) {
            console.error("Error checking out:", error);
            toast.error(`Failed to check out: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle start break
    const handleStartBreak = async () => {
        if (!isCheckedIn) {
            toast.error("You need to be checked in to take a break");
            return;
        }

        if (activeBreak) {
            toast.error("You're already on a break!");
            return;
        }

        try {
            setIsLoading(true);

            const breakData = {
                break_type: selectedBreakType,
                notes: `Started ${selectedBreakType} break`
            };

            // Call API
            await startBreak(breakData);

            // Refresh status from backend
            await fetchTodayStatus();

            const breakType = breakTypes.find(bt => bt.id === selectedBreakType);
            toast.success(`Started ${breakType.name} break`);

        } catch (error) {
            console.error("Error starting break:", error);
            toast.error(`Failed to start break: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle end break
    const handleEndBreak = async () => {
        if (!activeBreak) {
            toast.error("No active break to end!");
            return;
        }

        try {
            setIsLoading(true);

            // Call API
            await endBreak();

            // Store break name for success message before clearing state
            const breakName = activeBreak.name;

            // Refresh status from backend
            await fetchTodayStatus();

            toast.success(`Ended ${breakName} break`);

        } catch (error) {
            console.error("Error ending break:", error);
            toast.error(`Failed to end break: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Format time display
    const formatTime = (date) => {
        if (!date) return "--:--";
        // Check if date is a valid Date object
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "--:--";
        }
        return format(date, "hh:mm a");
    };

    // Human readable duration from HH:MM or minutes
    const formatDurationHuman = (input) => {
        let totalMinutes = 0;
        if (!input && input !== 0) return "0 min";

        if (typeof input === 'string' && input.includes(':')) {
            const [h, m] = input.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                totalMinutes = h * 60 + m;
            }
        } else if (typeof input === 'number') {
            totalMinutes = Math.max(0, Math.floor(input));
        } else if (typeof input === 'string') {
            // Try parse as minutes
            const parsed = parseInt(input, 10);
            if (!isNaN(parsed)) totalMinutes = parsed;
        }

        if (totalMinutes <= 0) return '0 min';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes} min`;
        if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
        return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
    };

    // Format date display
    const formatDate = (date) => {
        if (!date) return "";
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "";
        }
        return format(date, "EEEE, MMMM d, yyyy");
    };

    // Calculate total break time from history
    useEffect(() => {
        let totalBreakMinutes = 0;
        breakHistory.forEach(breakItem => {
            if (breakItem.endTime) {
                const start = new Date(breakItem.startTime);
                const end = new Date(breakItem.endTime);
                const diffMs = end - start;
                totalBreakMinutes += Math.floor(diffMs / 60000);
            }
        });
        const hours = Math.floor(totalBreakMinutes / 60);
        const minutes = totalBreakMinutes % 60;
        setBreakTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, [breakHistory]);

    // Calculate productive hours
    const calculateProductiveHours = () => {
        if (totalHours === "00:00") return "00:00";

        const [totalH, totalM] = totalHours.split(":").map(Number);
        const [breakH, breakM] = breakTime.split(":").map(Number);

        let totalMinutes = totalH * 60 + totalM;
        let breakMinutes = breakH * 60 + breakM;

        // Add active break time if any
        if (activeBreak) {
            const [activeH, activeM] = breakDuration.split(":").map(Number);
            breakMinutes += (activeH * 60 + activeM);
        }

        const productiveMinutes = Math.max(0, totalMinutes - breakMinutes);
        const prodHours = Math.floor(productiveMinutes / 60);
        const prodMinutes = productiveMinutes % 60;

        return `${prodHours.toString().padStart(2, '0')}:${prodMinutes.toString().padStart(2, '0')}`;
    };

    // Get break type by ID
    const getBreakTypeById = (id) => {
        return breakTypes.find(bt => bt.id === id) || breakTypes[0];
    };

    return (
        <Layout>
            <Header
                title="Time Attendance"
                subtitle="Check in/out and track your working hours"
                actionButtonText={isCheckedIn ? "Check Out" : "Check In"}
                onActionClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                actionButtonVariant={isCheckedIn ? "success" : "primary"}
            />

            <div className={styles["check-in-out-container"]}>
                {isLoading && (
                    <div className={styles["loading-overlay"]}>
                        <div className={styles["loading-spinner"]}></div>
                        <span>Processing...</span>
                    </div>
                )}

                <div className={styles["check-content"]}>
                    {/* Left Column - Status Card */}
                    <div className={styles["status-card"]}>
                        <div className={styles["status-header"]}>
                            <h2 className={styles["status-title"]}>Current Status</h2>
                            <div className={`${styles["status-indicator"]} ${isCheckedIn ? styles["checked-in"] : styles["checked-out"]}`}>
                                <div className={styles["status-dot"]}></div>
                                <span>{isCheckedIn ? "Checked In" : "Checked Out"}</span>
                            </div>
                        </div>

                        {/* Time Tracking */}
                        <div className={styles["time-tracker"]}>
                            <div className={styles["time-section"]}>
                                <div className={styles["time-label"]}>Check In Time</div>
                                <div className={styles["time-value"]}>
                                    {checkInTime ? formatTime(checkInTime) : "--:--"}
                                </div>
                            </div>
                            <div className={styles["time-section"]}>
                                <div className={styles["time-label"]}>Check Out Time</div>
                                <div className={styles["time-value"]}>
                                    {checkOutTime ? formatTime(checkOutTime) : "--:--"}
                                </div>
                            </div>
                            <div className={styles["time-section"]}>
                                <div className={styles["time-label"]}>Total Hours</div>
                                <div className={`${styles["time-value"]} ${styles["large"]}`}>{totalHours}</div>
                            </div>
                        </div>

                        {/* Break Section - Enhanced */}
                        <div className={`${styles["break-section"]} ${activeBreak ? styles["break-active-section"] : ''}`}
                            style={activeBreak ? {
                                backgroundColor: `${getBreakTypeById(activeBreak.type).color}15`,
                                borderColor: `${getBreakTypeById(activeBreak.type).color}30`
                            } : {}}>
                            <div className={styles["break-header"]}>
                                <div className={styles["break-title"]}>
                                    <span>Break Time</span>
                                    {activeBreak && (
                                        <span className={styles["break-type-badge"]}
                                            style={{ backgroundColor: getBreakTypeById(activeBreak.type).color }}>
                                            {activeBreak.name}
                                        </span>
                                    )}
                                </div>
                                <div className={styles["break-timer"]}>
                                    {activeBreak ? (
                                        <div className={styles["active-break-timer"]}>
                                            <span className={styles["break-duration"]}>{formatDurationHuman(breakDuration)}</span>
                                            <div className={styles["break-pulse"]}
                                                style={{ backgroundColor: getBreakTypeById(activeBreak.type).color }}>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={styles["break-time"]}>{formatDurationHuman(breakTime)}</span>
                                    )}
                                </div>
                            </div>

                            {/* Break Type Selection */}
                            <div className={styles["break-types"]}>
                                {breakTypes.map((breakType) => (
                                    <button
                                        key={breakType.id}
                                        className={`${styles["break-type-btn"]} ${selectedBreakType === breakType.id ? styles["selected-break-type"] : ''
                                            }`}
                                        onClick={() => !activeBreak && setSelectedBreakType(breakType.id)}
                                        disabled={activeBreak !== null}
                                        style={{
                                            backgroundColor: selectedBreakType === breakType.id ? `${breakType.color}20` : 'transparent',
                                            borderColor: selectedBreakType === breakType.id ? breakType.color : '#e5e7eb',
                                            color: selectedBreakType === breakType.id ? breakType.color : '#6b7280'
                                        }}
                                    >
                                        <span className={styles["break-type-icon"]} style={{ color: breakType.color }}>
                                            {breakType.icon}
                                        </span>
                                        <span className={styles["break-type-name"]}>{breakType.name}</span>
                                        <span className={styles["break-type-desc"]}>{breakType.description}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Break Action Buttons */}
                            <div className={styles["break-actions"]}>
                                {activeBreak ? (
                                    <button
                                        className={styles["end-break-btn"]}
                                        onClick={handleEndBreak}
                                        disabled={isLoading}
                                        style={{
                                            backgroundColor: getBreakTypeById(activeBreak.type).color,
                                            borderColor: getBreakTypeById(activeBreak.type).color
                                        }}
                                    >
                                        <FiClock className={styles["btn-icon"]} />
                                        {isLoading ? "Ending..." : `End ${activeBreak.name}`}
                                    </button>
                                ) : (
                                    <button
                                        className={styles["start-break-btn"]}
                                        onClick={handleStartBreak}
                                        disabled={!isCheckedIn || isLoading}
                                        style={{
                                            backgroundColor: getBreakTypeById(selectedBreakType).color,
                                            borderColor: getBreakTypeById(selectedBreakType).color
                                        }}
                                    >
                                        <FiClock className={styles["btn-icon"]} />
                                        {isLoading ? "Starting..." : `Start ${getBreakTypeById(selectedBreakType).name}`}
                                    </button>
                                )}
                            </div>

                            {/* Active Break Info */}
                            {activeBreak && (
                                <div className={styles["active-break-info"]}>
                                    <div className={styles["active-break-details"]}>
                                        <div className={styles["detail-item"]}>
                                            <span className={styles["detail-label"]}>Started:</span>
                                            <span className={styles["detail-value"]}>
                                                {formatTime(activeBreak.startTime)}
                                            </span>
                                        </div>
                                        <div className={styles["detail-item"]}>
                                            <span className={styles["detail-label"]}>Duration:</span>
                                            <span className={styles["detail-value"]}>
                                                {formatDurationHuman(breakDuration)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles["break-warning"]}>
                                        <FiAlertCircle className={styles["warning-icon"]} />
                                        <span>Don't forget to end your break when you return!</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Work Location */}
                        <div className={styles["location-section"]}>
                            <div className={styles["section-header"]}>
                                <FiMapPin className={styles["section-icon"]} />
                                <span>Work Location</span>
                            </div>
                            <div className={styles["location-options"]}>
                                {locationOptions.map((location) => (
                                    <button
                                        key={location}
                                        className={`${styles["location-option"]} ${workLocation === location ? styles["selected"] : ''}`}
                                        onClick={() => setWorkLocation(location)}
                                        disabled={isCheckedIn}
                                    >
                                        {location}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location Tracking */}
                        {currentLocation && (
                            <div className={styles["gps-section"]}>
                                <div className={styles["section-header"]}>
                                    <FiWifi className={styles["section-icon"]} />
                                    <span>Current Location</span>
                                </div>
                                <div className={styles["gps-coordinates"]}>
                                    <div className={styles["coordinate"]} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span>📍</span>
                                        <span>{currentLocation.address}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Action Buttons */}
                        <div className={styles["action-buttons"]}>
                            {isCheckedIn ? (
                                <button
                                    className={styles["check-out-btn"]}
                                    onClick={handleCheckOut}
                                    disabled={isLoading}
                                >
                                    <FiXCircle className={styles["btn-icon"]} />
                                    {isLoading ? "Checking Out..." : "Check Out"}
                                </button>
                            ) : (
                                <button
                                    className={styles["check-in-btn"]}
                                    onClick={handleCheckIn}
                                    disabled={isLoading}
                                >
                                    <FiCheckCircle className={styles["btn-icon"]} />
                                    {isLoading ? "Checking In..." : "Check In"}
                                </button>
                            )}

                            <button
                                className={styles["refresh-location-btn"]}
                                onClick={() => getCurrentLocation(true)}
                                disabled={isLoadingLocation || isLoading}
                            >
                                <FiRefreshCw className={`${styles["btn-icon"]} ${isLoadingLocation ? styles["spinning"] : ''}`} />
                                {isLoadingLocation ? "Getting Location..." : "Refresh Location"}
                            </button>
                        </div>


                    </div>

                    {/* Right Column - History */}
                    <div className={styles["history-card"]}>
                        <h2 className={styles["history-title"]}>Today's Activity</h2>

                        {/* Summary Stats */}
                        <div className={styles["summary-stats"]}>
                            <div className={styles["stat-item"]}>
                                <div className={styles["stat-value"]}>{totalHours}</div>
                                <div className={styles["stat-label"]}>Total Hours</div>
                            </div>
                            <div className={styles["stat-item"]}>
                                <div className={styles["stat-value"]}>
                                    {activeBreak ? (
                                        <div className={styles["active-break-indicator"]}>
                                            <span className={styles["active-break-value"]}>
                                                {formatDurationHuman(breakTime)} + {formatDurationHuman(breakDuration)}
                                            </span>
                                            <div className={styles["live-dot"]}
                                                style={{ backgroundColor: getBreakTypeById(activeBreak?.type)?.color }}></div>
                                        </div>
                                    ) : (
                                        formatDurationHuman(breakTime)
                                    )}
                                </div>
                                <div className={styles["stat-label"]}>Break Time</div>
                            </div>
                            <div className={styles["stat-item"]}>
                                <div className={styles["stat-value"]}>{calculateProductiveHours()}</div>
                                <div className={styles["stat-label"]}>Productive Hours</div>
                            </div>
                        </div>

                        {/* Session History */}
                        <div className={styles["session-history"]}>
                            <h3 className={styles["section-subtitle"]}>Session History</h3>
                            <div className={styles["history-list"]}>
                                {sessionHistory.length > 0 ? (
                                    sessionHistory.map((session) => (
                                        <div key={session.id} className={styles["history-item"]}>
                                            <div className={styles["history-item-main"]}>
                                                <div className={`${styles["history-type"]} ${styles[session.type]}`}>
                                                    {session.type === "check-in" ? "Check In" : "Check Out"}
                                                </div>
                                                <div className={styles["history-time"]}>
                                                    {formatTime(session.time)}
                                                </div>
                                            </div>
                                            {session.type === "check-in" && session.location && (
                                                <div className={styles["history-details"]}>
                                                    <span className={styles["detail-label"]}>Location:</span>
                                                    <span className={styles["detail-value"]}>{session.location}</span>
                                                </div>
                                            )}
                                            {session.type === "check-out" && session.totalHours && (
                                                <div className={styles["history-details"]}>
                                                    <span className={styles["detail-label"]}>Duration:</span>
                                                    <span className={styles["detail-value"]}>{session.totalHours}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles["empty-history"]}>
                                        No activity recorded today
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Break History - Enhanced */}
                        <div className={styles["break-history"]}>
                            <div className={styles["break-history-header"]}>
                                <h3 className={styles["section-subtitle"]}>Break History</h3>
                                <div className={styles["break-stats"]}>
                                    <span className={styles["break-count"]}>
                                        {breakHistory.filter(b => b.endTime).length} breaks today
                                    </span>
                                </div>
                            </div>
                            <div className={styles["history-list"]}>
                                {breakHistory.length > 0 ? (
                                    breakHistory.map((breakItem) => {
                                        const breakType = getBreakTypeById(breakItem.type);
                                        const isActive = breakItem.id === activeBreak?.id;

                                        return (
                                            <div key={breakItem.id}
                                                className={`${styles["history-item"]} ${styles["break-item"]} ${isActive ? styles["active-break-item"] : ''}`}
                                                style={isActive ? {
                                                    borderLeftColor: breakType.color,
                                                    backgroundColor: `${breakType.color}10`
                                                } : {}}>
                                                <div className={styles["history-item-main"]}>
                                                    <div className={styles["break-type-header"]}>
                                                        <span className={styles["break-type-icon"]} style={{ color: breakType.color }}>
                                                            {breakType.icon}
                                                        </span>
                                                        <div className={`${styles["history-type"]} ${styles["break"]}`}>
                                                            {breakItem.name} {breakItem.endTime ? "" : "(Active)"}
                                                        </div>
                                                    </div>
                                                    <div className={styles["history-time"]}>
                                                        {formatTime(breakItem.startTime)}
                                                        {breakItem.endTime && ` → ${formatTime(breakItem.endTime)}`}
                                                    </div>
                                                </div>
                                                <div className={styles["history-details"]}>
                                                    {breakItem.endTime ? (
                                                        <>
                                                            <span className={styles["detail-label"]}>Duration:</span>
                                                            <span className={styles["detail-value"]}>
                                                                {breakItem.duration}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <div className={styles["active-break-indicator"]}>
                                                            <span className={styles["live-tag"]} style={{ backgroundColor: breakType.color }}>
                                                                LIVE
                                                            </span>
                                                            <span className={styles["current-duration"]}>
                                                                {breakDuration} elapsed
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={styles["empty-history"]}>
                                        <FiClock className={styles["empty-icon"]} />
                                        <span>No breaks taken today</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Weekly Summary Preview */}
                        <div className={styles["weekly-summary"]}>
                            <h3 className={styles["section-subtitle"]}>This Week's Summary</h3>
                            <div className={styles["week-stats"]}>
                                <div className={styles["week-stat"]}>
                                    <div className={styles["week-value"]}>{weeklyTotalHours}</div>
                                    <div className={styles["week-label"]}>Total Hours</div>
                                </div>
                                <div className={styles["week-stat"]}>
                                    <div className={styles["week-value"]}>{weeklyAvgDaily}</div>
                                    <div className={styles["week-label"]}>Avg. Daily</div>
                                </div>
                                <div className={styles["week-stat"]}>
                                    <div className={styles["week-value"]}>{weeklyAttendance}</div>
                                    <div className={styles["week-label"]}>Attendance</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className={styles["check-footer"]}>
                    <div className={styles["footer-info"]}>
                        <div className={styles["info-item"]}>
                            <span className={styles["info-label"]}>Device Time:</span>
                            <span className={styles["info-value"]}>{formatTime(currentTime)}</span>
                        </div>
                        <div className={styles["info-item"]}>
                            <span className={styles["info-label"]}>Timezone:</span>
                            <span className={styles["info-value"]}>UTC {new Date().getTimezoneOffset() / -60}</span>
                        </div>
                        <div className={styles["info-item"]}>
                            <span className={styles["info-label"]}>Last Sync:</span>
                            <span className={styles["info-value"]}>Just now</span>
                        </div>
                    </div>
                    <div className={styles["footer-note"]}>
                        <FiAlertCircle className={styles["note-icon"]} />
                        <span>Your attendance is automatically recorded and tracked for reporting.</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CheckInOut;