import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import BaseModal from "../components/modals/BaseModal";
import {
  PIPELINE_DEPARTMENTS,
  PIPELINE_LEVELS,
  PIPELINE_PRIORITIES,
  PIPELINE_SOURCES,
  PIPELINE_STAGES,
  createPipelineItem,
  deletePipelineItem,
  getSalesPipelineReport,
  listPipelineItems,
  updatePipelineItem,
} from "../api/salesMarketing";
import { getOrganizationMembers } from "../api/users";
import styles from "../styles/SalesMarketing.module.css";

const EMPTY_FORM = {
  prospect_name: "",
  company_name: "",
  deal_title: "",
  department: "sales",
  hierarchy_level: "executive",
  source: "upwork",
  stage: "new",
  priority: "medium",
  profile_url: "",
  external_account: "",
  estimated_value: 0,
  currency: "USD",
  probability: 20,
  next_follow_up: "",
  notes: "",
  tags: "",
  assigned_to_id: "",
};

function toDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatMoney(value, currency = "USD") {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export default function SalesMarketing() {
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    source: "",
    stage: "",
    hierarchy_level: "",
  });
  const prospectInputRef = useRef(null);

  const isAdmin = ["admin", "super_admin"].includes(
    localStorage.getItem("userRole") || ""
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelineData, membersData] = await Promise.all([
        listPipelineItems(filters),
        getOrganizationMembers().catch(() => []),
      ]);
      setItems(Array.isArray(pipelineData) ? pipelineData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);

      if (isAdmin) {
        const reportData = await getSalesPipelineReport();
        setReport(reportData);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || error.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const timer = window.setTimeout(() => {
      prospectInputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isModalOpen]);

  const stageLabel = useMemo(
    () => Object.fromEntries(PIPELINE_STAGES.map((item) => [item.value, item.label])),
    []
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startNewLead = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      prospect_name: item.prospect_name || "",
      company_name: item.company_name || "",
      deal_title: item.deal_title || "",
      department: item.department || "sales",
      hierarchy_level: item.hierarchy_level || "executive",
      source: item.source || "upwork",
      stage: item.stage || "new",
      priority: item.priority || "medium",
      profile_url: item.profile_url || "",
      external_account: item.external_account || "",
      estimated_value: item.estimated_value || 0,
      currency: item.currency || "USD",
      probability: item.probability || 0,
      next_follow_up: toDateInput(item.next_follow_up),
      notes: item.notes || "",
      tags: item.tags || "",
      assigned_to_id: item.assigned_to_id || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.prospect_name.trim()) {
      toast.error("Prospect name is required");
      return;
    }

    const payload = {
      ...form,
      estimated_value: Number(form.estimated_value || 0),
      probability: Number(form.probability || 0),
      assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
      next_follow_up: form.next_follow_up ? new Date(form.next_follow_up).toISOString() : null,
    };

    try {
      setSaving(true);
      if (editingId) {
        await updatePipelineItem(editingId, payload);
        toast.success("Pipeline item updated");
      } else {
        await createPipelineItem(payload);
        toast.success("Pipeline item created");
      }
      closeModal();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || error.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this pipeline item?")) return;
    try {
      await deletePipelineItem(itemId);
      toast.success("Deleted");
      if (editingId === itemId) closeModal();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message || "Delete failed");
    }
  };

  return (
    <Layout>
      <Header
        title="Sales & Marketing Pipeline"
        subtitle="Single source of truth for Upwork, LinkedIn, and other leads. Existing developer workflows stay unchanged."
      />

      <div className={styles.page}>
        {report && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>{report.open_items}</h3>
              <p>Open Pipeline</p>
            </div>
            <div className={styles.statCard}>
              <h3>{formatMoney(report.total_estimated_value)}</h3>
              <p>Open Value</p>
            </div>
            <div className={styles.statCard}>
              <h3>{formatMoney(report.weighted_pipeline_value)}</h3>
              <p>Weighted Value</p>
            </div>
            <div className={styles.statCard}>
              <h3>{report.won_items}</h3>
              <p>Won Deals</p>
            </div>
            <div className={styles.statCard}>
              <h3>{report.overdue_followups}</h3>
              <p>Overdue Follow-ups</p>
            </div>
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search prospect, company, deal..."
            />
            <select name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="">All departments</option>
              {PIPELINE_DEPARTMENTS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select name="source" value={filters.source} onChange={handleFilterChange}>
              <option value="">All sources</option>
              {PIPELINE_SOURCES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select name="stage" value={filters.stage} onChange={handleFilterChange}>
              <option value="">All stages</option>
              {PIPELINE_STAGES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select name="hierarchy_level" value={filters.hierarchy_level} onChange={handleFilterChange}>
              <option value="">All levels</option>
              {PIPELINE_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <button className={styles.secondaryBtn} type="button" onClick={loadData}>
              Apply Filters
            </button>
          </div>
          <button className={styles.primaryBtn} type="button" onClick={startNewLead}>
            New Lead
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>Pipeline Board</h2>
              <span className={styles.muted}>{items.length} items</span>
            </div>

            {loading ? (
              <div className={styles.empty}>Loading pipeline...</div>
            ) : items.length === 0 ? (
              <div className={styles.empty}>No pipeline items yet. Click New Lead to add one.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Prospect</th>
                      <th>Source</th>
                      <th>Dept / Level</th>
                      <th>Stage</th>
                      <th>Value</th>
                      <th>Owner</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.prospect_name}</strong>
                          <div className={styles.muted}>{item.company_name || item.deal_title || "—"}</div>
                          {item.profile_url && (
                            <div className={styles.muted}>
                              <a href={item.profile_url} target="_blank" rel="noreferrer">Profile</a>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={styles.badge}>{item.source}</span>
                          <div className={styles.muted}>{item.external_account || "—"}</div>
                        </td>
                        <td>
                          <div>{item.department}</div>
                          <div className={styles.muted}>{item.hierarchy_level}</div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${item.stage}`}>
                            {stageLabel[item.stage] || item.stage}
                          </span>
                        </td>
                        <td>
                          <div>{formatMoney(item.estimated_value, item.currency)}</div>
                          <div className={styles.muted}>{item.probability}% prob.</div>
                        </td>
                        <td>{item.assigned_to_name || "Unassigned"}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.secondaryBtn} type="button" onClick={() => handleEdit(item)}>
                              Edit
                            </button>
                            {isAdmin && (
                              <button className={styles.dangerBtn} type="button" onClick={() => handleDelete(item.id)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>Stage Breakdown</h2>
            </div>
            {report?.by_stage?.length ? (
              <div className={styles.breakdownList}>
                {report.by_stage.map((bucket) => (
                  <div className={styles.breakdownItem} key={bucket.key}>
                    <span>{stageLabel[bucket.key] || bucket.key}</span>
                    <strong>{bucket.count} · {formatMoney(bucket.value)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>No stage data yet.</div>
            )}
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Lead" : "New Lead"}
        footer={
          <div className={styles.formActions}>
            <button className={styles.secondaryBtn} type="button" onClick={closeModal}>
              Cancel
            </button>
            <button
              className={styles.primaryBtn}
              type="submit"
              form="sales-lead-form"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        }
      >
        <form id="sales-lead-form" className={styles.formGrid} onSubmit={handleSubmit}>
          <label>
            Prospect Name *
            <input
              ref={prospectInputRef}
              name="prospect_name"
              value={form.prospect_name}
              onChange={handleChange}
              required
              placeholder="Client / prospect name"
            />
          </label>
          <label>
            Company
            <input name="company_name" value={form.company_name} onChange={handleChange} />
          </label>
          <label>
            Deal Title
            <input name="deal_title" value={form.deal_title} onChange={handleChange} />
          </label>
          <label>
            External Account
            <input
              name="external_account"
              value={form.external_account}
              onChange={handleChange}
              placeholder="Upwork/LinkedIn account"
            />
          </label>
          <label>
            Department
            <select name="department" value={form.department} onChange={handleChange}>
              {PIPELINE_DEPARTMENTS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Hierarchy Level
            <select name="hierarchy_level" value={form.hierarchy_level} onChange={handleChange}>
              {PIPELINE_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Source
            <select name="source" value={form.source} onChange={handleChange}>
              {PIPELINE_SOURCES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Stage
            <select name="stage" value={form.stage} onChange={handleChange}>
              {PIPELINE_STAGES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PIPELINE_PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Assigned To
            <select name="assigned_to_id" value={form.assigned_to_id} onChange={handleChange}>
              <option value="">Assign to me</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.role})
                </option>
              ))}
            </select>
          </label>
          <label>
            Estimated Value
            <input
              type="number"
              min="0"
              step="0.01"
              name="estimated_value"
              value={form.estimated_value}
              onChange={handleChange}
            />
          </label>
          <label>
            Probability %
            <input
              type="number"
              min="0"
              max="100"
              name="probability"
              value={form.probability}
              onChange={handleChange}
            />
          </label>
          <label>
            Next Follow-up
            <input type="date" name="next_follow_up" value={form.next_follow_up} onChange={handleChange} />
          </label>
          <label>
            Profile URL
            <input
              name="profile_url"
              value={form.profile_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>
          <label className={styles.full}>
            Tags
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="cold-outreach, agency, retainer"
            />
          </label>
          <label className={styles.full}>
            Notes
            <textarea name="notes" rows={4} value={form.notes} onChange={handleChange} />
          </label>
        </form>
      </BaseModal>
    </Layout>
  );
}
