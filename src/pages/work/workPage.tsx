
import React, { useEffect, useRef, useState } from 'react';
import HeroSection from '../../components/work/heroSection';
import ServicesSection from '../../components/work/servicesSection';
import BenefitSection from '../../components/work/benefitSection';
import ShopSection from '../../components/work/shopSection';
import FooterSection from '../../components/ui/footer';
import AuthModal from '../../components/auth/AuthModal';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { WorkPageSkeleton } from '../../components/ui/skeletons';

const WorkPage: React.FC = () => {
    const [authOpen, setAuthOpen] = useState(() => {
        return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') !== 'true';
    });

    const pageRef = useRef<HTMLDivElement | null>(null);
    const [cursorActive, setCursorActive] = useState(false);

    const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);

    const targetPosRef = useRef({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: 0, y: 0 });
    const initializedRef = useRef(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, []);

    const startAnimation = () => {
        if (rafRef.current) return;

        const tick = () => {
            const node = pageRef.current;
            if (!node) {
                rafRef.current = null;
                return;
            }

            const target = targetPosRef.current;
            const current = currentPosRef.current;

            const lerp = 0.12;
            current.x += (target.x - current.x) * lerp;
            current.y += (target.y - current.y) * lerp;

            setTrail((prev) => {
                const next = [{ x: current.x, y: current.y }, ...prev];
                return next.slice(0, 56);
            });

            const dx = Math.abs(target.x - current.x);
            const dy = Math.abs(target.y - current.y);

            if (!cursorActive && dx < 0.02 && dy < 0.02) {
                rafRef.current = null;
                return;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const node = pageRef.current;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetPosRef.current = { x, y };

        if (!initializedRef.current) {
            initializedRef.current = true;
            currentPosRef.current = { x, y };
            setTrail([{ x, y }]);
        }

        setCursorActive(true);
        startAnimation();
    };

    const handleMouseLeave = () => {
        setCursorActive(false);
        startAnimation();
    };

    return (
        <InitialShimmer delayMs={850} skeleton={<WorkPageSkeleton />}>
            <div
                ref={pageRef}
                className="min-h-screen bg-white relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="relative z-10">
                    <HeroSection
                        shouldAnimateCounts={!authOpen}
                        onSignUpClick={() => setAuthOpen(true)}
                    />
                    <ServicesSection />
                    <BenefitSection />
                    <ShopSection />
                    <FooterSection />
                </div>
                <div className={`page-cursor-trail ${cursorActive ? 'active' : ''}`}>
                    {trail.map((p, idx) => {
                        const strength = Math.pow(1 - idx / Math.max(1, trail.length), 2);
                        return (
                            <div
                                key={idx}
                                className="page-cursor-dot"
                                style={{
                                    left: `${p.x}px`,
                                    top: `${p.y}px`,
                                    opacity: 0.10 * strength,
                                    transform: `translate(-50%, -50%) scale(${2.5 + strength * 0.65})`,
                                }}
                            />
                        );
                    })}
                </div>

                <AuthModal
                    open={authOpen}
                    mode="signup"
                    closable
                    onClose={() => setAuthOpen(false)}
                    onSuccess={() => setAuthOpen(false)}
                />
            </div>
        </InitialShimmer>
    );
};

export default WorkPage;

