import resend

from app.config import settings


def send_verification_email(to_email: str, token: str) -> None:
    resend.api_key = settings.resend_api_key
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"
    resend.Emails.send({
        "from": "The Nest <onboarding@resend.dev>",
        "to": to_email,
        "subject": "Verify your Nest account",
        "html": (
            "<h2>Welcome to The Nest</h2>"
            "<p>Click the link below to verify your Cal State LA email address:</p>"
            f'<a href="{verify_url}" style="background:#003087;color:#fff;padding:12px 24px;'
            'border-radius:6px;text-decoration:none;display:inline-block;">Verify my email</a>'
            "<p style='color:#666;font-size:13px;'>This link expires in 24 hours. "
            "If you did not create a Nest account, you can ignore this email.</p>"
        ),
    })


def send_password_reset(to_email: str, token: str) -> None:
    raise NotImplementedError
