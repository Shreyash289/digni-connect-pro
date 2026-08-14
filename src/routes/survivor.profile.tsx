import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  User,
  MapPin,
  BookOpen,
  Briefcase,
  Award,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMySurvivorProfile,
  saveMySurvivorProfile,
} from "@/lib/survivor.portal.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/survivor/profile")({
  head: () => ({ meta: [{ title: "My Profile · CAREVIA" }] }),
  component: SurvivorProfilePage,
});

const SURVIVOR_NAV = [
  { to: "/survivor/dashboard", label: "Dashboard" },
  { to: "/survivor/profile", label: "My Profile" },
  { to: "/survivor/applications", label: "My Applications" },
  { to: "/mentor", label: "AI Mentor" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

interface EducationItem {
  level: string;
  institution: string;
  field?: string;
  year?: number;
}

interface WorkItem {
  role: string;
  org: string;
  start: string;
  end?: string;
  description?: string;
}

interface CertItem {
  name: string;
  issuer: string;
  year?: number;
  url?: string;
}

function SurvivorProfilePage() {
  return (
    <PortalShell
      title="Survivor Portal"
      nav={SURVIVOR_NAV}
      allow={["survivor", "admin", "super_admin"]}
    >
      <ProfileForm />
    </PortalShell>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-survivor-profile", user?.id],
    queryFn: () => getMySurvivorProfile(),
    enabled: !!user,
  });

  // Form states
  const [fullName, setFullName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [bio, setBio] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [availability, setAvailability] = useState<
    "full_time" | "part_time" | "remote" | "onsite" | "flexible" | ""
  >("");

  // Array states
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [workHistory, setWorkHistory] = useState<WorkItem[]>([]);
  const [certifications, setCertifications] = useState<CertItem[]>([]);

  // Consents
  const [consentRecruiters, setConsentRecruiters] = useState(false);
  const [consentAi, setConsentAi] = useState(true);

  // Populate form when data loads
  useEffect(() => {
    if (!data) return;
    const s = data.survivor;
    setFullName(s?.full_name || data.defaultName || "");
    setPronouns(s?.pronouns || "");
    setGender(s?.gender || "");
    setDob(s?.date_of_birth ? s.date_of_birth.substring(0, 10) : "");
    setPhone(s?.phone || data.defaultPhone || "");
    setEmail(s?.email || user?.email || "");
    setEmergencyContact(s?.emergency_contact || "");
    setCity(s?.city || "");
    setState(s?.state || s?.location_region || "");
    setCountry(s?.country || s?.location_country || "India");
    setBio(s?.bio || "");
    setEducationLevel(s?.education_level || "");
    setAvailability((s?.availability as any) || "");
    setSkills(s?.skills || []);
    setLanguages(s?.languages || []);
    setInterests(s?.interests || []);
    setEducation((s?.education as EducationItem[]) || []);
    setWorkHistory((s?.work_history as WorkItem[]) || []);
    setCertifications((s?.certifications as CertItem[]) || []);
    setConsentRecruiters(s?.consent_share_with_recruiters ?? false);
    setConsentAi(s?.consent_ai_processing ?? true);
  }, [data, user]);

  const saveMutation = useMutation({
    mutationFn: (profileData: any) =>
      saveMySurvivorProfile({ data: { data: profileData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-survivor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["survivor-portal"] });
      toast.success("Profile saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save profile.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    saveMutation.mutate({
      full_name: fullName.trim(),
      pronouns: pronouns || null,
      gender: gender || null,
      date_of_birth: dob || null,
      phone: phone || null,
      email: email || null,
      emergency_contact: emergencyContact || null,
      city: city || null,
      state: state || null,
      country: country || "India",
      location_region: state || city || null,
      location_country: country || "India",
      bio: bio || null,
      skills,
      languages,
      interests,
      education_level: educationLevel || null,
      education,
      work_history: workHistory,
      certifications,
      availability: availability || null,
      consent_share_with_recruiters: consentRecruiters,
      consent_ai_processing: consentAi,
    });
  };

  // Helper additions
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const addLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (l: string) => {
    setLanguages(languages.filter((lang) => lang !== l));
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterest("");
    }
  };

  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-destructive" />
        <p className="mt-3 font-semibold text-foreground">Could not load profile.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal background, skills, experience, and privacy settings.
          </p>
        </div>
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="gap-2 shrink-0"
        >
          {saveMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saveMutation.isPending ? "Saving…" : "Save Profile"}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 gap-1">
          <TabsTrigger value="personal" className="py-2 text-xs md:text-sm gap-1.5">
            <User className="size-4" /> Personal
          </TabsTrigger>
          <TabsTrigger value="bio" className="py-2 text-xs md:text-sm gap-1.5">
            <BookOpen className="size-4" /> Bio & Skills
          </TabsTrigger>
          <TabsTrigger value="work" className="py-2 text-xs md:text-sm gap-1.5">
            <Briefcase className="size-4" /> Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="py-2 text-xs md:text-sm gap-1.5">
            <Award className="size-4" /> Education
          </TabsTrigger>
          <TabsTrigger value="privacy" className="py-2 text-xs md:text-sm gap-1.5">
            <Shield className="size-4" /> Privacy
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Personal & Contact ────────────────────────────────────────── */}
        <TabsContent value="personal" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold text-lg text-foreground">Basic Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priyanshi Sharma"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="e.g. she/her, they/them"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="e.g. Female"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-border" />
            <h2 className="font-semibold text-lg text-foreground">Contact & Location</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name and contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Region</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── 2. Bio & Skills ──────────────────────────────────────────────── */}
        <TabsContent value="bio" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold text-lg text-foreground">About You & Availability</h2>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your background, career aspirations, and what drives you..."
              />
              <p className="text-xs text-muted-foreground">
                A good bio increases your profile completion by 10%.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="availability">Work Availability</Label>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select availability</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="remote">Remote only</option>
                  <option value="onsite">On-site</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_level">Highest Education Level</Label>
                <Input
                  id="education_level"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="e.g. Secondary School, Diploma, Bachelor's"
                />
              </div>
            </div>

            <hr className="border-border" />
            <h2 className="font-semibold text-lg text-foreground">Skills & Languages</h2>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Add or Enter..."
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="size-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                ) : (
                  skills.map((sk) => (
                    <Badge key={sk} variant="secondary" className="gap-1 pr-1.5 text-xs">
                      {sk}
                      <button
                        type="button"
                        onClick={() => removeSkill(sk)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                  placeholder="e.g. Hindi, English, Tamil..."
                />
                <Button type="button" variant="outline" onClick={addLanguage}>
                  <Plus className="size-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {languages.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No languages added yet.</p>
                ) : (
                  languages.map((l) => (
                    <Badge key={l} variant="outline" className="gap-1 pr-1.5 text-xs">
                      {l}
                      <button
                        type="button"
                        onClick={() => removeLanguage(l)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests & Hobbies</Label>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  placeholder="e.g. Handicrafts, Healthcare, Hospitality..."
                />
                <Button type="button" variant="outline" onClick={addInterest}>
                  <Plus className="size-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {interests.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No interests added yet.</p>
                ) : (
                  interests.map((i) => (
                    <Badge key={i} variant="outline" className="gap-1 pr-1.5 text-xs">
                      {i}
                      <button
                        type="button"
                        onClick={() => removeInterest(i)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── 3. Work History ──────────────────────────────────────────────── */}
        <TabsContent value="work" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Work Experience</h2>
                <p className="text-xs text-muted-foreground">
                  Add past jobs, freelance work, apprenticeships, or vocational training.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setWorkHistory([
                    ...workHistory,
                    { role: "", org: "", start: "", end: "", description: "" },
                  ])
                }
              >
                <Plus className="size-4" /> Add Experience
              </Button>
            </div>

            {workHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Briefcase className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No work experience listed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => setWorkHistory(workHistory.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="grid gap-3 sm:grid-cols-2 pr-8">
                      <div>
                        <Label className="text-xs">Job Title / Role *</Label>
                        <Input
                          value={item.role}
                          onChange={(e) => {
                            const copy = [...workHistory];
                            copy[idx].role = e.target.value;
                            setWorkHistory(copy);
                          }}
                          placeholder="e.g. Tailoring Assistant"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Company / NGO / Organization *</Label>
                        <Input
                          value={item.org}
                          onChange={(e) => {
                            const copy = [...workHistory];
                            copy[idx].org = e.target.value;
                            setWorkHistory(copy);
                          }}
                          placeholder="e.g. Women's Craft Collective"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Start Date *</Label>
                        <Input
                          value={item.start}
                          onChange={(e) => {
                            const copy = [...workHistory];
                            copy[idx].start = e.target.value;
                            setWorkHistory(copy);
                          }}
                          placeholder="e.g. 2022"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Date (or Present)</Label>
                        <Input
                          value={item.end || ""}
                          onChange={(e) => {
                            const copy = [...workHistory];
                            copy[idx].end = e.target.value;
                            setWorkHistory(copy);
                          }}
                          placeholder="e.g. 2024 or Present"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Key Responsibilities / Achievements</Label>
                      <Textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => {
                          const copy = [...workHistory];
                          copy[idx].description = e.target.value;
                          setWorkHistory(copy);
                        }}
                        placeholder="Brief summary of what you did..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── 4. Education & Certifications ────────────────────────────────── */}
        <TabsContent value="education" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Education Details</h2>
                <p className="text-xs text-muted-foreground">
                  Degrees, diplomas, school certificates, or training courses.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setEducation([
                    ...education,
                    { level: "", institution: "", field: "", year: undefined },
                  ])
                }
              >
                <Plus className="size-4" /> Add Education
              </Button>
            </div>

            {education.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Award className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No education entries listed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="grid gap-3 sm:grid-cols-2 pr-8">
                      <div>
                        <Label className="text-xs">Level / Degree *</Label>
                        <Input
                          value={item.level}
                          onChange={(e) => {
                            const copy = [...education];
                            copy[idx].level = e.target.value;
                            setEducation(copy);
                          }}
                          placeholder="e.g. Class 10 / High School"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Institution / School *</Label>
                        <Input
                          value={item.institution}
                          onChange={(e) => {
                            const copy = [...education];
                            copy[idx].institution = e.target.value;
                            setEducation(copy);
                          }}
                          placeholder="e.g. St. Jude High School"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Field of Study</Label>
                        <Input
                          value={item.field || ""}
                          onChange={(e) => {
                            const copy = [...education];
                            copy[idx].field = e.target.value;
                            setEducation(copy);
                          }}
                          placeholder="e.g. General / Vocational"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Year of Completion</Label>
                        <Input
                          type="number"
                          value={item.year || ""}
                          onChange={(e) => {
                            const copy = [...education];
                            copy[idx].year = e.target.value ? parseInt(e.target.value) : undefined;
                            setEducation(copy);
                          }}
                          placeholder="e.g. 2020"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Certifications</h2>
                <p className="text-xs text-muted-foreground">
                  Skill certificates, vocational badges, or course completions.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setCertifications([
                    ...certifications,
                    { name: "", issuer: "", year: undefined, url: "" },
                  ])
                }
              >
                <Plus className="size-4" /> Add Certificate
              </Button>
            </div>

            {certifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Award className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No certifications listed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setCertifications(certifications.filter((_, i) => i !== idx))
                      }
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="grid gap-3 sm:grid-cols-2 pr-8">
                      <div>
                        <Label className="text-xs">Certificate Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const copy = [...certifications];
                            copy[idx].name = e.target.value;
                            setCertifications(copy);
                          }}
                          placeholder="e.g. Certified Data Entry Operator"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Issuing Organization *</Label>
                        <Input
                          value={item.issuer}
                          onChange={(e) => {
                            const copy = [...certifications];
                            copy[idx].issuer = e.target.value;
                            setCertifications(copy);
                          }}
                          placeholder="e.g. NSDC India"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Year</Label>
                        <Input
                          type="number"
                          value={item.year || ""}
                          onChange={(e) => {
                            const copy = [...certifications];
                            copy[idx].year = e.target.value
                              ? parseInt(e.target.value)
                              : undefined;
                            setCertifications(copy);
                          }}
                          placeholder="e.g. 2023"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Verification URL</Label>
                        <Input
                          value={item.url || ""}
                          onChange={(e) => {
                            const copy = [...certifications];
                            copy[idx].url = e.target.value;
                            setCertifications(copy);
                          }}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── 5. Privacy & Consents ────────────────────────────────────────── */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold text-lg text-foreground">Privacy & Sharing Preferences</h2>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 bg-muted/20">
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">
                  Share Anonymously with Verified Recruiters
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow verified recruiters to discover your anonymized skills and location in the talent directory. Your name and contact details are NEVER shared without explicit consent.
                </p>
              </div>
              <Switch
                checked={consentRecruiters}
                onCheckedChange={setConsentRecruiters}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 bg-muted/20">
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">
                  AI Career Mentor & Resume Processing
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow CAREVIA's AI Career Mentor to read your profile to provide personalized advice, resume tailoring, and job match recommendations.
                </p>
              </div>
              <Switch checked={consentAi} onCheckedChange={setConsentAi} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {saveMutation.isPending ? "Saving Profile…" : "Save All Changes"}
        </Button>
      </div>
    </form>
  );
}
