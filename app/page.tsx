export default function Home() {
  return (
    <div>
      <div>
        <input type="file" accept=".pdf,.doc,.docx" />
      </div>
      <div>
        <textarea
          rows={10}
          cols={50}
          placeholder="Paste job posting URL or job description text here"
        ></textarea>
      </div>
    </div>
  );
}
