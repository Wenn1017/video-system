import nltk
from transformers import pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from gensim.summarization.summarizer import summarize
from gensim.summarization import keywords
from sklearn.feature_extraction.text import TfidfVectorizer
from pymongo import MongoClient

# Download required NLTK resources
nltk.download('stopwords')
nltk.download('punkt')

# Load Hugging Face summarization model
summarizer_hf = pipeline("summarization", model="facebook/bart-large-cnn")

# MongoDB connection
client = MongoClient("your_mongodb_connection_string")
db = client["video_analysis"]
transcriptions_collection = db["transcriptions"]
nlp_results_collection = db["nlp_results"]

def get_latest_transcription():
    """Retrieve the latest transcription from MongoDB."""
    transcription = transcriptions_collection.find_one(sort=[("_id", -1)])
    return transcription["transcription"] if transcription else None

def summarize_text_huggingface(text):
    """Summarize text using Hugging Face Transformers (BART)."""
    max_input = 1024  # Model has a token limit
    if len(text.split()) > 400:  # Adjusting to model limit
        text = " ".join(text.split()[:400])
    
    summary = summarizer_hf(text, max_length=150, min_length=50, do_sample=False)
    return summary[0]["summary_text"]

def summarize_text_sumy(text, sentence_count=3):
    """Summarize text using Sumy LSA algorithm."""
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentence_count)
    return " ".join([str(sentence) for sentence in summary])

def summarize_text_gensim(text):
    """Summarize text using Gensim."""
    return summarize(text, ratio=0.3)  # 30% of the text

def extract_keywords_tfidf(text, num_keywords=5):
    """Extract important keywords using TF-IDF."""
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    sorted_indices = vectors.toarray().argsort()[0][-num_keywords:][::-1]
    return [feature_names[i] for i in sorted_indices]

def extract_keywords_textrank(text):
    """Extract important keywords using TextRank (Gensim)."""
    return keywords(text, words=5, lemmatize=True).split("\n")

def process_nlp():
    """Process NLP tasks on the latest transcription."""
    transcription = get_latest_transcription()
    if not transcription:
        print("No transcription found.")
        return
    
    summary_hf = summarize_text_huggingface(transcription)
    summary_sumy = summarize_text_sumy(transcription)
    summary_gensim = summarize_text_gensim(transcription)
    keywords_tfidf = extract_keywords_tfidf(transcription)
    keywords_textrank = extract_keywords_textrank(transcription)
    
    nlp_results = {
        "summary_huggingface": summary_hf,
        "summary_sumy": summary_sumy,
        "summary_gensim": summary_gensim,
        "keywords_tfidf": keywords_tfidf,
        "keywords_textrank": keywords_textrank
    }
    
    # Store NLP results in MongoDB
    nlp_results_collection.insert_one(nlp_results)
    print("NLP processing complete. Results stored in MongoDB.")

def get_nlp_results():
    """Retrieve the latest NLP results for frontend display."""
    return nlp_results_collection.find_one(sort=[("_id", -1)])

if __name__ == "__main__":
    process_nlp()