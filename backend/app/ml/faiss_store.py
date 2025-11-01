import faiss
import numpy as np
import os
import pickle

class FaissIndex:
    def __init__(self, dim=512, index_path="backend/data/faiss/faiss.index"):
        self.dim = dim
        self.index_path = index_path
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            self.id_map = pickle.load(open(index_path + ".pkl", "rb"))
        else:
            self.index = faiss.IndexFlatIP(dim)  # inner product = cosine similarity (after normalization)
            self.id_map = {}  # map from FAISS index -> person_id
            self.next_id = 0

    def add_embedding(self, embedding, person_id):
        embedding = embedding / np.linalg.norm(embedding)
        self.index.add(np.expand_dims(embedding, axis=0))
        self.id_map[self.index.ntotal - 1] = person_id
        # Save index
        faiss.write_index(self.index, self.index_path)
        pickle.dump(self.id_map, open(self.index_path + ".pkl", "wb"))

    def search(self, embedding, top_k=5):
        if self.index.ntotal == 0:
            return []
        embedding = embedding / np.linalg.norm(embedding)
        D, I = self.index.search(np.expand_dims(embedding, axis=0), top_k)
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx == -1:
                continue
            results.append({"person_id": self.id_map[idx], "similarity": float(dist)})
        return results
