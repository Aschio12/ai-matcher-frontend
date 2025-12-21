import ResumeUpload from '../../components/ResumeUpload';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                        AI Resume Matcher Dashboard
                    </h1>
                    <p className="text-slate-400">
                        Upload your resume to get started with AI-powered job matching
                    </p>
                </div>

                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
                        Resume Upload
                    </h2>
                    <ResumeUpload />
                </section>

                {/* Future sections (Stats, Matches, etc.) can go here */}
            </div>
        </div>
    );
}
