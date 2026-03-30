'use client';

/**
 * Exit-confirmation bottom sheet shown when the user presses Back while no
 * modal is open on the dashboard.  Styled to match AddRecordModal / InfoModal.
 *
 * Props:
 *  onConfirm – called when the user chooses to leave (navigate to login)
 *  onCancel  – called when the user chooses to stay
 */
export default function ExitConfirmDialog({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500">

                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span
                            className="material-symbols-outlined text-primary"
                            style={{ fontSize: '32px' }}
                        >
                            logout
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black font-headline text-on-surface tracking-tight">
                            Thoát ứng dụng?
                        </h2>
                        <p className="text-sm text-on-surface-variant/70 mt-2 font-medium leading-relaxed">
                            Bạn có muốn quay về trang đăng nhập không?<br />
                            Dữ liệu của bé vẫn được lưu an toàn.
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl font-bold border-2 border-outline-variant/40 text-on-surface-variant hover:bg-surface-container transition-all active:scale-95"
                    >
                        Ở lại
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 rounded-2xl font-extrabold bg-soft-gradient text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
                    >
                        Về trang chủ
                    </button>
                </div>

            </div>
        </div>
    );
}
