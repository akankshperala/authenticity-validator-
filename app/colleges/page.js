"use client";
import { useState, useEffect } from "react";

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetches the initial list of colleges when the component mounts
  useEffect(() => {
    async function fetchColleges() {
      try {
        const res = await fetch("/api/colleges");
        if (!res.ok) {
          throw new Error("Failed to fetch colleges");
        }
        const data = await res.json();
        setColleges(data.colleges);
      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();
  }, []);

  // Handles the form submission to add a new college
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); // Clear previous errors

    try {
      const res = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add college");
      }

      // Add the new college to the state and clear form inputs
      setColleges(prev => [...prev, data.college]);
      setName("");
      setAddress("");
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>College Directory 🎓</h1>
      </header>

      <div style={styles.content}>
        <section style={styles.collegeListSection}>
          <h2 style={styles.sectionTitle}>All Colleges</h2>
          {loading ? (
            <p>Loading colleges...</p>
          ) : colleges.length > 0 ? (
            <ul style={styles.list}>
              {colleges.map(c => (
                <li key={c.id} style={styles.listItem}>
                  <div style={styles.collegeName}>{c.name}</div>
                  <div style={styles.collegeAddress}>{c.address}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No colleges found. Add one below!</p>
          )}
        </section>

        <section style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Add a New College</h2>
          {err && <div style={styles.error}>{err}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="College Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Add College</button>
          </form>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  header: {
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    color: '#333',
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    width: '100%',
    maxWidth: '800px',
  },
  collegeListSection: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    color: '#555',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.3s ease',
  },
  collegeName: {
    fontWeight: 'bold',
    color: '#333',
  },
  collegeAddress: {
    color: '#666',
    fontStyle: 'italic',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  button: {
    padding: '1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  error: {
    color: '#ff4d4f',
    backgroundColor: '#fff1f0',
    border: '1px solid #ffccc7',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  }
};