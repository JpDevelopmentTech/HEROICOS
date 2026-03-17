import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  level: string;
  emergencyContact: string;
  avatar?: File | null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function signUp(data: SignUpData) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        birth_date: data.birthDate,
        level: data.level,
        emergency_contact: data.emergencyContact,
      },
    },
  });

  if (error) throw error;

  // Upload avatar if provided and session is active
  if (data.avatar && authData.user && authData.session) {
    try {
      const avatarUrl = await uploadAvatar(authData.user.id, data.avatar);
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', authData.user.id);
    } catch (e) {
      console.error('Avatar upload failed:', e);
    }
  } else if (data.avatar && authData.user && !authData.session) {
    // No session (email confirmation pending) — store file for later upload
    try {
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('pending_avatar', reader.result as string);
        sessionStorage.setItem('pending_avatar_name', data.avatar!.name);
      };
      reader.readAsDataURL(data.avatar);
    } catch (_) { /* ignore */ }
  }

  return authData;
}

/** Upload a pending avatar after the user confirms email and logs in */
export async function uploadPendingAvatar(): Promise<void> {
  const dataUrl = sessionStorage.getItem('pending_avatar');
  const fileName = sessionStorage.getItem('pending_avatar_name');
  if (!dataUrl || !fileName) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Convert data URL back to File
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: blob.type });

    const avatarUrl = await uploadAvatar(user.id, file);
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);
  } catch (e) {
    console.error('Pending avatar upload failed:', e);
  } finally {
    sessionStorage.removeItem('pending_avatar');
    sessionStorage.removeItem('pending_avatar_name');
  }
}

/** Update avatar for an already logged-in user */
export async function updateAvatar(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const avatarUrl = await uploadAvatar(user.id, file);
  await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  return avatarUrl;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
