import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useTranslation } from "react-i18next";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";

const teamMembers = [
  { id: 1, name: "Alex Johnson", role: "Lead Developer", photo: team1, bio: "Full-stack architect with 8+ years building scalable web applications" },
  { id: 2, name: "Sarah Chen", role: "UX Designer", photo: team2, bio: "User experience specialist focused on creating intuitive digital interfaces" },
  { id: 3, name: "David Rodriguez", role: "Project Manager", photo: team3, bio: "Strategic project leader ensuring seamless delivery and client satisfaction" }
];

const TeamMosaic = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("about.team.title")}
          highlight={t("about.team.titleHighlight")}
          subtitle={t("about.team.subtitle")}
        />

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }} whileHover={{ y: -5 }}>
              <GlassCard className="overflow-hidden group cursor-pointer">
                <div className="relative">
                  <div className="aspect-square overflow-hidden mb-6">
                    <img src={member.photo} alt={`${member.name} - ${member.role}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <motion.div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end" initial={false}>
                    <div className="p-6 text-white"><p className="text-sm leading-relaxed">{member.bio}</p></div>
                  </motion.div>
                </div>
                <div className="text-center group-hover:text-primary transition-colors">
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-muted-foreground group-hover:text-primary/80 transition-colors">{member.role}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamMosaic;
