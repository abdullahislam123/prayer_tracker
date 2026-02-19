import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, UserPlus, Eye, EyeOff, User } from "lucide-react";

const Auth = ({ onSuccess, theme }) => {
    const [mode, setMode] = useState("login"); // 'login', 'signup'
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const cleanError = (msg) => {
        if (msg.includes("auth/user-not-found")) return "Account not found";
        if (msg.includes("auth/wrong-password")) return "Invalid password";
        if (msg.includes("auth/email-already-in-use")) return "Email already registered";
        if (msg.includes("auth/weak-password")) return "Password too weak (6+ chars needed)";
        if (msg.includes("auth/invalid-email")) return "Invalid email address";
        return msg.replace("Firebase: ", "").replace("Error (auth/", "").replace(").", "");
    };

    const validatePassword = (pass) => {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
        return strongRegex.test(pass);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");

        if (mode === "signup") {
            if (!name.trim()) {
                setError("Please enter your full name");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (!validatePassword(password)) {
                setError("Password must be 8+ chars, include Uppercase, Lowercase & Number.");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
            } else if (mode === "signup") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(cleanError(err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(cleanError(err.message));
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-700 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-[#F1F5F9]'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full max-w-md p-8 md:p-10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] text-center border relative overflow-hidden ${theme === 'dark' ? 'bg-white/[0.03] border-white/10 shadow-black' : 'bg-white border-slate-100 shadow-slate-200'}`}
            >
                <div className={`absolute -top-32 -right-32 w-64 h-64 blur-[100px] ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/20'}`} />
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 blur-[100px] ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-500/20'}`} />

                <div className="relative z-10">
                    <h1 className={`text-4xl font-black italic mb-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        SALAH <span className="text-emerald-500">PRO</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 italic">
                        {mode === 'login' && "Welcome Back"}
                        {mode === 'signup' && "Join the Journey"}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-4">
                            {mode === 'signup' && (
                                <div className={`group flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'}`}>
                                    <User size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className={`bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                        required
                                    />
                                </div>
                            )}

                            <div className={`group flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'}`}>
                                <Mail size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className={`bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                    required
                                />
                            </div>

                            <div className={`group flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'}`}>
                                <Lock size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={`bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-emerald-500 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {mode === 'signup' && (
                                <div className={`group flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'}`}>
                                    <Lock size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-bold text-rose-500 bg-rose-500/10 py-2 px-4 rounded-xl"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${theme === 'dark' ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}
              `}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                <>
                                    {mode === 'login' && <>Sign In <ArrowRight size={16} /></>}
                                    {mode === 'signup' && <>Create Account <UserPlus size={16} /></>}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className={`absolute inset-0 flex items-center ${theme === 'dark' ? 'text-white/10' : 'text-slate-200'}`}>
                            <div className="w-full border-t border-current"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                            <span className={`px-4 ${theme === 'dark' ? 'bg-[#020617] text-slate-500' : 'bg-[#F1F5F9] text-slate-400'}`}>Or Continue With</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-4 transition-all font-black text-xs uppercase tracking-widest group border
              ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
            `}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Google
                    </button>

                    <div className={`mt-8 flex flex-col gap-3 text-[11px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {mode === 'login' && (
                            <>
                                <button onClick={() => setMode('signup')} className="hover:text-emerald-500 transition-colors">
                                    Don't have an account? <span className="ml-1 text-emerald-500">Join</span>
                                </button>
                            </>
                        )}

                        {mode === 'signup' && (
                            <button onClick={() => setMode('login')} className="hover:text-emerald-500 transition-colors">
                                Already have an account? <span className="ml-1 text-emerald-500">Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
