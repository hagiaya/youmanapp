import { supabase } from './supabase';

export const getUserId = () => {
    let id = localStorage.getItem('youman_user_id');
    if (!id) {
        id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('youman_user_id', id);
    }
    return id;
};

export const saveRituals = async (rituals) => {
    // 1. Local Storage (Utama untuk Offline)
    localStorage.setItem('youman_rituals', JSON.stringify(rituals));

    // 2. Real-time Sync ke Supabase (Jika Online)
    try {
        if (!navigator.onLine) return; // Skip jika offline
        
        const userId = getUserId();
        const date = new Date().toDateString();
        
        const payload = rituals.map(r => ({
            id: `${userId}_${date}_${r.id}`, // Format unik per hari per ritual
            user_id: userId,
            title: r.title,
            completed: r.completed,
            date: date,
            updated_at: new Date().toISOString()
        }));

        await supabase.from('user_rituals').upsert(payload, { onConflict: 'id' });
    } catch (e) {
        console.warn('Real-time sync pending for rituals');
    }
};

export const getRituals = () => {
    const saved = localStorage.getItem('youman_rituals');
    if (!saved) return null;
    try {
        const parsed = JSON.parse(saved);
        const lastUpdate = localStorage.getItem('youman_last_update');
        const today = new Date().toDateString();

        if (lastUpdate !== today) {
            localStorage.setItem('youman_last_update', today);
            return parsed.map(r => ({ ...r, completed: false }));
        }
        return parsed;
    } catch (e) {
        return null;
    }
};

export const getStreak = () => {
    const streak = localStorage.getItem('youman_streak') || "0";
    return parseInt(streak);
};

export const saveToHistory = async (date, percentage) => {
    // 1. Local Storage (Utama untuk Offline)
    const history = JSON.parse(localStorage.getItem('youman_history') || '[]');
    const index = history.findIndex(h => h.date === date);
    if (index >= 0) {
        history[index].percentage = percentage;
    } else {
        history.push({ date, percentage });
    }
    const trimmed = history.slice(-30); // Simpan 30 hari terakhir
    localStorage.setItem('youman_history', JSON.stringify(trimmed));

    // 2. Real-time Sync ke Supabase
    try {
        if (!navigator.onLine) return;
        const userId = getUserId();
        await supabase.from('user_history').upsert({
            id: `${userId}_${date}`,
            user_id: userId,
            date: date,
            percentage: percentage
        }, { onConflict: 'id' });
    } catch (e) {
        console.warn('Real-time sync pending for history');
    }
};

export const updateStreak = async (completedToday) => {
    const lastStreakUpdate = localStorage.getItem('youman_last_streak_update');
    const today = new Date().toDateString();

    let current = getStreak();
    let best = parseInt(localStorage.getItem('youman_best_streak') || "0");

    if (lastStreakUpdate !== today && completedToday) {
        current = current + 1;
        if (current > best) best = current;

        // Save ke Local
        localStorage.setItem('youman_streak', current.toString());
        localStorage.setItem('youman_best_streak', best.toString());
        localStorage.setItem('youman_last_streak_update', today);
        saveToHistory(today, 100);

        // Save ke Real-time Database
        try {
            if (navigator.onLine) {
                const userId = getUserId();
                await supabase.from('user_streaks').upsert({
                    user_id: userId,
                    current_streak: current,
                    best_streak: best,
                    last_update: today
                }, { onConflict: 'user_id' });
            }
        } catch (e) {
            console.warn('Real-time sync pending for streaks');
        }

        return current;
    }
    return current;
};

export const getHistory = () => {
    return JSON.parse(localStorage.getItem('youman_history') || '[]');
};

export const getDailyCheckin = () => {
    const today = new Date().toDateString();
    return localStorage.getItem('youman_checkin') === today;
};

export const doCheckin = () => {
    const today = new Date().toDateString();
    localStorage.setItem('youman_checkin', today);
};

export const clearAllData = () => {
    const keys = [
        'youman_rituals',
        'youman_streak',
        'youman_last_update',
        'youman_last_streak_update',
        'youman_history',
        'youman_checkin',
        'youman_workout_set',
        'youman_workouts',
        'youman_best_streak'
    ];
    keys.forEach(key => localStorage.removeItem(key));
};
