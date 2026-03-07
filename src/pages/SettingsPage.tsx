import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogOut, Bell, Shield, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FloatingParticles } from '@/components/FloatingParticles';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, loading, isMockMode } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user && !isMockMode) {
      navigate('/auth');
    }
  }, [loading, user, isMockMode, navigate]);

  const handleBack = () => {
    navigate('/app');
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      refreshProfile?.();
      toast.success('Profile photo updated!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !displayName.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id);

      if (error) throw error;
      refreshProfile?.();
      toast.success('Display name updated!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    }
  };

  // Get avatar URL - prioritize profile avatar, then user metadata (Google/Apple)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const firstName = profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Raver';

  if (loading) {
    return null;
  }

  if (!user && !isMockMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cosmic relative">
      <FloatingParticles />
      
      <div className="w-full max-w-[420px] mx-auto relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 glass-card border-t-0 rounded-t-none px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-card/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </header>

        <main className="px-4 py-6 space-y-6">
          {/* Profile Section */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Profile</h2>
            
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div 
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-full cursor-pointer group"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-2 border-primary/40"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground mt-2">Tap to change photo</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm text-foreground">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-card/50 border-border/50"
                />
                <Button 
                  onClick={handleUpdateDisplayName}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="mt-4 space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-sm text-foreground/70">{user?.email}</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Push Notifications</span>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Location Services</span>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Account</h2>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/10 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">Log Out</span>
              <ChevronRight className="w-4 h-4 text-destructive/50 ml-auto" />
            </button>
          </div>

          {/* App Info */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground/50">GemList v1.0</p>
            <p className="text-xs text-muted-foreground/30 mt-1">Made with 💎</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
