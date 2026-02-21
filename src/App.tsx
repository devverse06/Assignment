import { useCallback, useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import type { Artwork } from './types';
import { fetchArtworks, ROWS_PER_PAGE } from './api';

const INSCRIPTIONS_NA = 'N/A';

/** Selection rule: "first N rows" by global index. No data fetch — computed per page. */
type SelectionRule = { type: 'firstN'; n: number } | null;

function formatInscriptions(value: string | null): string {
  return value?.trim() || INSCRIPTIONS_NA;
}

/** Global 0-based index for a row on the current page. */
function globalIndex(currentPage: number, rowIndexInPage: number): number {
  return (currentPage - 1) * ROWS_PER_PAGE + rowIndexInPage;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectionRule, setSelectionRule] = useState<SelectionRule>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const overlayRef = useRef<OverlayPanel>(null);
  const toastRef = useRef<Toast>(null);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchArtworks(page);
      setArtworks(response.data);
      setTotalRecords(response.pagination.total);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  const onPage = (e: { first: number; rows: number }) => {
    const newPage = Math.floor(e.first / e.rows) + 1;
    setCurrentPage(newPage);
  };

  // Selection is computed lazily per page using index logic. No fetch, constant memory.
  const isRowSelectedByRule = useCallback(
    (id: number, rowIndexInPage: number): boolean => {
      if (!selectionRule || selectionRule.type !== 'firstN') return false;
      const idx = globalIndex(currentPage, rowIndexInPage);
      return idx < selectionRule.n && !excludedIds.has(id);
    },
    [selectionRule, currentPage, excludedIds]
  );

  const selectedRowsForTable = artworks.filter((a, i) => {
    const inRule = isRowSelectedByRule(a.id, i);
    return inRule || selectedIds.has(a.id);
  });

  const totalSelectedCount = selectionRule
    ? Math.min(selectionRule.n, totalRecords) - excludedIds.size + selectedIds.size
    : selectedIds.size;

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const newSelection = new Set((e.value ?? []).map((r) => r.id));
    const nextExcluded = new Set(excludedIds);
    const nextSelected = new Set(selectedIds);
    artworks.forEach((a, i) => {
      const g = globalIndex(currentPage, i);
      const inRule = selectionRule && selectionRule.type === 'firstN' && g < selectionRule.n;
      const nowSelected = newSelection.has(a.id);
      if (inRule) {
        if (nowSelected) nextExcluded.delete(a.id);
        else nextExcluded.add(a.id);
      } else {
        if (nowSelected) nextSelected.add(a.id);
        else nextSelected.delete(a.id);
      }
    });
    setExcludedIds(nextExcluded);
    setSelectedIds(nextSelected);
  };

  const selectAllOnCurrentPage = () => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      artworks.forEach((a, i) => {
        if (selectionRule && selectionRule.type === 'firstN' && globalIndex(currentPage, i) < selectionRule.n) {
          next.delete(a.id);
        }
      });
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      artworks.forEach((a, i) => {
        const inRule = selectionRule && selectionRule.type === 'firstN' && globalIndex(currentPage, i) < selectionRule.n;
        if (!inRule) next.add(a.id);
      });
      return next;
    });
  };

  const deselectAllOnCurrentPage = () => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      artworks.forEach((a, i) => {
        if (selectionRule && selectionRule.type === 'firstN' && globalIndex(currentPage, i) < selectionRule.n) {
          next.add(a.id);
        }
      });
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      artworks.forEach((a) => next.delete(a.id));
      return next;
    });
  };

  const onSelectAllChange = (e: { checked: boolean }) => {
    if (e.checked) selectAllOnCurrentPage();
    else deselectAllOnCurrentPage();
  };

  const allOnPageSelected =
    artworks.length > 0 &&
    artworks.every((a, i) => isRowSelectedByRule(a.id, i) || selectedIds.has(a.id));
  const someOnPageSelected =
    artworks.some((a, i) => isRowSelectedByRule(a.id, i) || selectedIds.has(a.id));
  const selectAllChecked = allOnPageSelected;
  const selectAllIndeterminate = someOnPageSelected && !allOnPageSelected;

  const [customSelectValue, setCustomSelectValue] = useState<number | null>(null);

  // Store selection rule only. Apply selection per page via index — no fetch, no other page data.
  const handleCustomSelect = () => {
    const n = customSelectValue ?? 0;
    if (!n || n <= 0) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Invalid input',
        detail: 'Please enter a valid number greater than 0.',
      });
      return;
    }
    setSelectionRule({ type: 'firstN', n });
    setExcludedIds(new Set());
    setSelectedIds(new Set());
    setCustomSelectValue(null);
    overlayRef.current?.hide();
    toastRef.current?.show({
      severity: 'info',
      summary: 'Selection rule applied',
      detail: `First ${n} rows will be selected.`,
    });
  };

  return (
    <PrimeReactProvider>
      <Toast ref={toastRef} />
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Art Institute of Chicago – Artworks</h1>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-gray-600">Selected: {totalSelectedCount} rows</span>
          <Button
            label="Select N rows..."
            icon="pi pi-list"
            className="p-button-sm p-button-outlined"
            onClick={(e) => overlayRef.current?.toggle(e)}
          />
        </div>
        <OverlayPanel ref={overlayRef}>
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Select Multiple Rows</h3>
            <p className="text-sm text-gray-600">
              Enter number of rows to select across all pages.
            </p>
            <div className="flex items-center gap-2">
              <InputNumber
                value={customSelectValue}
                onValueChange={(e) => setCustomSelectValue(e.value ?? null)}
                placeholder="e.g., 5"
                min={1}
                max={totalRecords}
                showButtons
              />
              <Button label="Select" onClick={handleCustomSelect} />
            </div>
          </div>
        </OverlayPanel>
        <DataTable
          value={artworks}
          selectionMode="multiple"
          lazy
          dataKey="id"
          paginator
          first={(currentPage - 1) * ROWS_PER_PAGE}
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          selection={selectedRowsForTable}
          onSelectionChange={onSelectionChange}
          selectAll={selectAllChecked}
          onSelectAllChange={onSelectAllChange}
          selectionPageOnly
          paginatorTemplate="PrevPageLink PageLinks NextPageLink"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header="TITLE" />
          <Column field="place_of_origin" header="PLACE OF ORIGIN" />
          <Column field="artist_display" header="ARTIST" />
          <Column
            field="inscriptions"
            header="INSCRIPTIONS"
            body={(row) => formatInscriptions(row.inscriptions)}
          />
          <Column field="date_start" header="START DATE" />
          <Column field="date_end" header="END DATE" />
        </DataTable>
      </div>
    </PrimeReactProvider>
  );
}

export default App;
