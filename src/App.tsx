
import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import './App.css';
import whisper from './assets/whisper.mp3';
import loader from './assets/loader.gif';

function App(): JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [birthdate, setBirthdate] = useState<string>('');
  const [birthtime, setBirthtime] = useState<string>('');
  const [birthplace, setBirthplace] = useState<string>('');
  const [fortune, setFortune] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  function getDateRange(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const startFortuneDate = date.toLocaleDateString('en-US', options);
    const futureDate = new Date(date);
    futureDate.setDate(date.getDate() + 7);
    const endFortuneDate = futureDate.toLocaleDateString('en-US', options);

    return `${startFortuneDate} - ${endFortuneDate}`;
  }

  function parseMarkdownTable(md: string): string[][] {
    const lines = md.split('\n');

    while (lines.length && !lines[0].trim().startsWith('|')) {
      lines.shift();
    }

    const tableLines = lines.filter(
      line => line.trim().startsWith('|') && !line.match(/^\|\s*-+\s*\|/)
    );

    const rows = tableLines.map(line =>
      line
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim().replace(/\*\*/g, ''))
    );

    const header = [
      'Day',
      'Energy',
      'Money Flow',
      'Opportunities',
      'Recommended Actions',
      'Love & Relationship',
      'Avoid',
    ];

    if (rows.length > 0 && JSON.stringify(rows[0]) === JSON.stringify(header)) {
      rows.shift();
    }

    return rows;
  }

  async function handleSubmitAPI(): Promise<void> {
    if (fortune) {
      setFortune('');
    }

    const whisperAudio = audioRef.current;
    setLoading(true);

    if (whisperAudio) {
      whisperAudio.volume = 0.4;
      whisperAudio.loop = true;
      whisperAudio.play();
    }

    if (!birthdate || !birthtime || !birthplace) {
      alert('Please fill in all fields.');
      setLoading(false);
      return;
    }
    

    try {
      const apiUrl = 'https://ai-tweet-bot-mp70.onrender.com/fortune/tell';
      const payload = {
        date_birth: birthdate,
        time_birth: birthtime,
        place_birth: birthplace,
      };

      const response = await axios.post<{ fortune: string }>(apiUrl, payload);
      setFortune(response.data.fortune || '');
      console.log(response.data.fortune);
    } catch (error) {
      console.error('Error calling API:', error);
      alert('Please, try again later...');
    } finally {
      setLoading(false);
      if (whisperAudio) {
        whisperAudio.loop = false;
        whisperAudio.currentTime = 0;
      }
    }
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setBirthdate(e.target.value);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setBirthtime(e.target.value);
  };

  const handlePlaceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setBirthplace(e.target.value);
  };

  const tableRows: string[][] = parseMarkdownTable(fortune);

  return (
    <>
      <div className="stars-layer"></div>
      <div className="w-[100svw] relative mx-auto min-h-[100svh]">
        <div className="w-full relative pt-10 text-center text-black">
          <h2 className="maintext text-[38px] md:text-[48px]">Cosmic Fortune Teller</h2>
          <h2 className="text-[16px] pt-2">
            Discover your weekly astrology reading through the stars
          </h2>
        </div>

        <div className="birthinfo_container w-[90%] md:w-[94%] max-w-[1200px] h-fit relative mx-auto mt-8 p-6 border-2 md:pb-10 border-amber-50/70 rounded-lg ">
          <h2 className="text-[30px] font-bold">Birth Details</h2>
          <p>Enter your birth details to receive your personalized cosmic reading</p>

          <div className="flex flex-col md:flex-row md:justify-around md:items-start mt-4 gap-4">
            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="birthdate" className="text-md mb-1">
                Birth Date:
              </label>
              <input
                className="border p-2 rounded-md"
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={handleDateChange}
                required
              />
            </div>

            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="birthtime" className="text-md mb-1">
                Birth Time:
              </label>
              <input
                type="time"
                id="birthtime"
                className="border p-2 rounded-md"
                value={birthtime}
                onChange={handleTimeChange}
                required
              />
            </div>

            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="birthplace" className="text-md mb-1">
                Place of Birth:
              </label>
              <input
                type="text"
                id="timezone"
                placeholder="City, Country"
                className="border p-2 rounded-md"
                value={birthplace}
                onChange={handlePlaceChange}
                required
              />
            </div>
          </div>

          <button
            className="btn_submit text-white font-semibold w-full mt-5 py-2 px-4 rounded transition-colors duration-300 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmitAPI}
            disabled={loading}
          >
            {loading ? 'Casting the spell...' : 'Reveal My Fortune'}
          </button>
        </div>

        {loading && !fortune && (
          <div className="absolute left-1/2 opacity-50 -translate-x-1/2 top-1/3 z-50 ease-in-out transition-all duration-[2000ms]">
            <img src={loader} alt="loading..." className="loader w-[200px]" />
          </div>
        )}

        {fortune && (
          <>
            <div className="w-[90%] md:w-[94%] max-w-[1200px] mx-auto mt-6 text-black">
              <h2 className="relative text-[40px]">Your Weekly Astrology Reading</h2>
              <p className="relative top-0 left-1.5">{getDateRange()}</p>
            </div>

            <div className="table mt-6 text-black w-[98%] md:w-[94%] mx-auto max-w-[1200px] transition-all duration-[2000ms] ease-in-out">
              <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base">
                <thead className="bg-gray-700/70 text-left text-white ">
                  <tr>
                    <th className="border border-gray-300 p-2">Day</th>
                    <th className="border border-gray-300 p-2">Energy</th>
                    <th className="border border-gray-300 p-2">Money Flow</th>
                    <th className="border border-gray-300 p-2">Opportunities</th>
                    <th className="border border-gray-300 p-2">Recommended Actions</th>
                    <th className="border border-gray-300 p-2">Love & Relationship</th>
                    <th className="border border-gray-300 p-2">Avoid</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-4">
                        {loading
                          ? 'Loading fortune...'
                          : 'No fortune available. Please enter your details and try again.'}
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-black/30' : 'bg-black/10'}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-gray-300 p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex relative w-[90%] md:w-[94%] max-w-[1200px] mx-auto justify-end mt-2 mb-2">
          <p className="relative bottom-0 right-0 text-[14px] text-black">
            Disclaimer: This is for entertainment. Please use your own judgment when interpreting
            the content.
          </p>
        </div>

        <audio ref={audioRef} src={whisper} />
      </div>
    </>
  );
}

export default App;
