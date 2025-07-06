import { useRef, useState } from 'react';
import axios from 'axios';

interface Props {
  type: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ type, onClose }: Props) {
  const [formType, setFormType] = useState<'login' | 'signup'>(type);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (formType === 'signup') {
      if (!form.name.trim()) newErrors.name = 'Name is required';
      if (!form.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Enter valid mobile number';
    }
    if (!form.email.includes('@')) newErrors.email = 'Email must contain @';
    if (formType === 'signup' && form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const endpoint = formType === 'signup' ? '/api/signup' : '/api/login';
      const { data } = await axios.post(`https://betmaster-backend.onrender.com${endpoint}`, form);

      setSuccess(data.msg);

      // Store JWT token
      localStorage.setItem('token', data.token);

      // Store user data
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('name', data.user.name);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('balance', data.user.balance.toString());

      setTimeout(() => {
        window.location.href = '/dashboard'; // ✅ Redirect to dashboard instead of root
      }, 1500);
    } catch (err: any) {
      setErrors({ general: err.response?.data?.msg || 'Something went wrong' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const switchForm = () => {
    setErrors({});
    setSuccess('');
    setForm({ name: '', email: '', phone: '', password: '' });
    setFormType(formType === 'signup' ? 'login' : 'signup');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <span className="close" onClick={onClose}>×</span>
        <h2 className="modal-title">{formType === 'signup' ? 'Create Account' : 'Log In'}</h2>

        {formType === 'signup' && (
          <>
            <input
              ref={el => { inputsRef.current[0] = el; }}
              placeholder="Name"
              onKeyDown={e => handleKeyDown(e, 0)}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}

            <input
              ref={el => { inputsRef.current[1] = el; }}
              placeholder="Phone"
              onKeyDown={e => handleKeyDown(e, 1)}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </>
        )}

        <input
          ref={el => { inputsRef.current[2] = el; }}
          placeholder="Email"
          onKeyDown={e => handleKeyDown(e, 2)}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <input
          type="password"
          ref={el => { inputsRef.current[3] = el; }}
          placeholder="Password"
          onKeyDown={e => handleKeyDown(e, 3)}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        {errors.general && <p className="field-error">{errors.general}</p>}
        {success && <p className="field-success">{success}</p>}

        <button className="btn" onClick={handleSubmit}>
          {formType === 'signup' ? 'Sign Up' : 'Login'}
        </button>

        <p className="toggle-form-text">
          {formType === 'signup' ? "Already have an account? " : "Don't have an account? "}
          <span className="toggle-link" onClick={switchForm}>
            {formType === 'signup' ? 'Log in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
