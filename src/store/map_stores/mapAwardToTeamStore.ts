import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

interface SpecialAward {
  teamid: number;
  award_name: string;
}

interface SpecialAwardState {
  awards: SpecialAward[];
  isLoading: boolean;
  error: string | null;

  getAwardsByTeam: (teamId: number) => Promise<void>;
  AwardsByTeamTable: (teamId: number) => Promise<void>;
  createAward: (award: SpecialAward) => Promise<void>;
  updateAward: (teamId: number, awardName: string, updatedAward: SpecialAward) => Promise<void>;
  deleteAward: (teamId: number, awardName: string) => Promise<void>;
  clearAwards: () => void;
}

const useSpecialAwardStore = create<SpecialAwardState>()(
  persist(
    (set) => ({
      awards: [],
      isLoading: false,
      error: null,

      getAwardsByTeam: async (teamId: number) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`/api/mapping/awardToTeam/getAwardByTeam/${teamId}/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          set({ awards: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: "Error fetching awards", isLoading: false });
        }
      },

      AwardsByTeamTable: async (teamId: number) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`/api/mapping/awardToTeam/getAwardByTeam/${teamId}/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });

          set((state) => ({
            awards: { ...state.awards, [teamId]: response.data },
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: "Error fetching awards", isLoading: false });
        }
      },
      

      createAward: async (award: SpecialAward) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          await axios.post(`/api/mapping/awardToTeam/create/`, award, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          set((state) => ({ awards: [...state.awards, award], isLoading: false }));
        } catch (error: any) {
          set({ error: "Error creating award", isLoading: false });
        }
      },

      updateAward: async (teamId: number, awardName: string, updatedAward: SpecialAward) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          await axios.put(`/api/mapping/awardToTeam/update/${teamId}/${awardName}/`, updatedAward, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          set((state) => ({
            awards: state.awards.map((award) =>
              award.teamid === teamId && award.award_name === awardName ? updatedAward : award
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: "Error updating award", isLoading: false });
        }
      },

      deleteAward: async (teamId: number, awardName: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`/api/mapping/awardToTeam/delete/${teamId}/${awardName}/`, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          set((state) => ({
            awards: state.awards.filter(
              (award) => !(award.teamid === teamId && award.award_name === awardName)
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: "Error deleting award", isLoading: false });
        }
      },

      clearAwards: () => set({ awards: [], error: null }),
    }),
    {
      name: "special-award-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useSpecialAwardStore;
