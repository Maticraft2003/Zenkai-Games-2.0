function ZenkaiNotice({ children, title = "ERROR", role = "alert", className = "" }) {
  return (
    <div className={`zenkai-notice ${className}`.trim()} role={role}>
      <span className="zenkai-notice-icon" aria-hidden="true">!</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export default ZenkaiNotice;
