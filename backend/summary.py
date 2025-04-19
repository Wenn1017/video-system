from flask import Flask
import nltk
from transformers import pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Download necessary NLTK resources
# nltk.download('stopwords')
# nltk.download('punkt')
# nltk.download('punkt_tab')

# Initialize Hugging Face summarizer
summarizer_hf = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text_huggingface(text):
    if len(text.split()) > 400:  
        text = " ".join(text.split()[:400])  # Limit input size for summarization
    
    summary = summarizer_hf(text, max_length=250, min_length=50, do_sample=False)
    return summary[0]["summary_text"]

def summarize_text_sumy(text, sentence_count=3):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentence_count)
    return " ".join([str(sentence) for sentence in summary])

def extract_keywords_tfidf(text, num_keywords=5):
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    sorted_indices = vectors.toarray().argsort()[0][-num_keywords:][::-1]
    return [feature_names[i] for i in sorted_indices]

def generate_summary_and_keywords(text):

    # Generate summaries
    summary_hf = summarize_text_huggingface(text)
    summary_sumy = summarize_text_sumy(text)

    return {
            "summary_huggingface": summary_hf,
            "summary_sumy": summary_sumy,
        }

if __name__ == "__main__":
    app.run(debug=True)