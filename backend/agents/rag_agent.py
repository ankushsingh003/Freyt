import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import RetrievalQA

load_dotenv()

class DiagnosisAgent:
    def __init__(self, pdf_path="data/freight-europe-general-terms-and-conditions-for-transport-services-en.pdf"):
        self.pdf_path = pdf_path
        self.persist_directory = "chroma_db_final"
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        self.vectorstore = None
        self.qa_chain = None
        
        # Check if vectorstore already exists, if not, create it
        if not os.path.exists(self.persist_directory):
            self._initialize_rag()
        else:
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
            self._setup_qa_chain()

    def _initialize_rag(self):
        """
        Loads the PDF, splits text, and creates the vector database.
        """
        # Try a few common paths to the data folder
        possible_paths = [
            self.pdf_path,
            os.path.join("..", self.pdf_path),
            os.path.join("data", os.path.basename(self.pdf_path))
        ]
        
        found_path = None
        for path in possible_paths:
            if os.path.exists(path):
                found_path = path
                break
        
        if not found_path:
            print(f"Error: DHL PDF Handbook not found. Please ensure it exists at: {self.pdf_path}")
            return

        print(f"Success: Loading Carrier Handbook from {found_path}")
        loader = PyPDFLoader(found_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        texts = text_splitter.split_documents(documents)
        
        self.vectorstore = Chroma.from_documents(
            documents=texts,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        self._setup_qa_chain()

    def _setup_qa_chain(self):
        """
        Sets up the QA chain using the LLM.
        """
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever()
        )

    def diagnose_risk(self, weather_condition, humidity):
        """
        Queries the handbook to see if current weather violates any shipping rules.
        """
        if not self.qa_chain:
            return {"error": "RAG system not initialized properly."}

        query = f"The current weather condition is {weather_condition} with {humidity} humidity. " \
                f"What are the specific requirements or restrictions for transport services in these conditions according to the GTC?"

        try:
            response = self.qa_chain.run(query)
            return {
                "diagnosis": response,
                "source": "DHL Freight GTC"
            }
        except Exception as e:
            return {"error": f"RAG Query failed: {str(e)}"}

if __name__ == "__main__":
    # Test block
    # Ensure you are running from the root directory or adjust pdf_path
    agent = DiagnosisAgent(pdf_path="../../data/freight-europe-general-terms-and-conditions-for-transport-services-en.pdf")
    print(agent.diagnose_risk("Rain", "90%"))
