import React from 'react';
import { Users, Mail, Phone, GraduationCap, MapPin, Code2, Sparkles } from 'lucide-react';

const teamMembers = [
    {
        id: 1,
        name: "Shiva Ganesh Talikota",
        email: "shivaganesh9108@gmail.com",
        phone: "8297024365",
        role: "Team Lead",
        color: "from-blue-500 to-indigo-600",
        college: "Kommuri Pratap Redyy Institute of Technology",
        year: "Semester 8",
        branch: "Computer Science",
        gender: "Male",
    },
    {
        id: 2,
        name: "Syeda Sanobar Ali",
        email: "sdsanobar@gmail.com",
        phone: "7207151440",
        role: "Frontend Developer",
        color: "from-pink-500 to-rose-600",
        college: "Kommuri Pratap Redyy Institute of Technology",
        year: "Semester 8",
        branch: "Computer Science",
        gender: "Female",
    },
    {
        id: 3,
        name: "Harsha Vardhan Reddy Mallela",
        email: "harshareddyvardhan15112003@gmail.com",
        phone: "9392304799",
        role: "Backend Developer",
        color: "from-emerald-500 to-teal-600",
        college: "Kommuri Pratap Redyy Institute of Technology",
        year: "Semester 8",
        branch: "Computer Science",
        gender: "Male",
    },
    {
        id: 4,
        name: "Nanam Dinesh",
        email: "nanamdinesh84@gmail.com",
        phone: "9063639896",
        role: "AI/ML Engineer",
        color: "from-amber-500 to-orange-600",
        college: "Kommuri Pratap Redyy Institute of Technology",
        year: "Semester 8",
        branch: "Computer Science",
        gender: "Male",
    },
    {
        id: 5,
        name: "Kudipudi Geethika",
        email: "kudipudigeethika@gmail.com",
        phone: "8125806694",
        role: "UI/UX Designer",
        color: "from-violet-500 to-purple-600",
        college: "Kommuri Pratap Redyy Institute of Technology",
        year: "Semester 8",
        branch: "Computer Science",
        gender: "Female",
    },
];

export default function Team() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <Sparkles size={14} />
                    <span>Code Unnati Innovation Marathon 4.0 — Team 13494</span>
                </div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                    Meet Team pAIr
                </h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    The passionate minds behind pAIr, working to simplify compliance for millions of Indian MSMEs.
                </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member, idx) => (
                    <div key={member.id}
                        className="card overflow-hidden transition-all hover:shadow-xl group"
                        style={{ animationDelay: `${idx * 0.08}s`, border: '1px solid var(--border)' }}>
                        {/* Gradient header */}
                        <div className={`h-24 bg-gradient-to-r ${member.color} relative`}>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-lg"
                                    style={{ borderColor: 'var(--bg)', background: 'var(--bg-secondary)', color: 'var(--text)' }}>
                                    {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-14 pb-6 px-6 text-center">
                            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>{member.name}</h3>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--accent)' }}>{member.role}</p>

                            <div className="space-y-3 text-sm text-left p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Mail size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="truncate text-xs">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Phone size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="text-xs">{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                                    <GraduationCap size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="text-xs">{member.college}</span>
                                </div>
                                <div className="flex items-center gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Code2 size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="text-xs">{member.year} • {member.branch}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer note */}
            <div className="text-center mt-12 mb-8 p-6 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    All members from <strong>Kommuri Pratap Redyy Institute of Technology</strong> •
                    Semester 8, Computer Science • CU Students • Advance Course Track
                </p>
            </div>
        </div>
    );
}
